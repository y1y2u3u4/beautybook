import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isDatabaseAvailable } from '@/lib/db-utils';
import { handleApiError, createErrorResponse, ValidationError } from '@/lib/api-utils';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 *
 * Security:
 * - In production, webhook secret is REQUIRED
 * - In development, allows direct parsing with warning
 * - Signature verification prevents event spoofing
 */
export async function POST(request: NextRequest) {
  if (!stripe) {
    // Demo mode - Stripe not configured
    return NextResponse.json({ received: true, mode: 'demo' });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return createErrorResponse('Missing stripe-signature header', 400);
  }

  // In production, webhook secret is REQUIRED
  if (isProduction && !webhookSecret) {
    console.error('[Webhook] CRITICAL: Webhook secret not configured in production');
    return createErrorResponse('Webhook configuration error', 500);
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      // Verify signature with webhook secret
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Development only: parse event directly with warning
      console.warn(
        '[Webhook] WARNING: No webhook secret configured. ' +
        'This is only acceptable in development. ' +
        'Set STRIPE_WEBHOOK_SECRET in production!'
      );
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Webhook] Signature verification failed:', errorMessage);
    return createErrorResponse('Webhook signature verification failed', 400);
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    // Log but still acknowledge to prevent Stripe retries piling up
    console.warn('[Webhook] Database unavailable - acknowledging event without processing');
    return NextResponse.json({ received: true, processed: false, reason: 'database_unavailable' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        // Acknowledge unhandled events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleApiError(error, 'Stripe Webhook');
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const appointmentId = session.metadata?.appointmentId;
  const paymentType = session.metadata?.paymentType;

  if (!appointmentId) {
    return;
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    console.error(`[Webhook] Appointment not found: ${appointmentId}`);
    return;
  }

  if (paymentType === 'deposit') {
    // Mark deposit as paid
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        depositPaid: true,
        depositPaymentId: session.payment_intent as string,
        status: 'CONFIRMED',
      },
    });
  } else {
    // Mark full payment as paid
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: 'PAID',
        paymentId: session.payment_intent as string,
        status: 'CONFIRMED',
      },
    });
  }

  // Create payment received notification
  try {
    await prisma.notification.create({
      data: {
        userId: appointment.customerId,
        appointmentId: appointment.id,
        type: 'PAYMENT_RECEIVED',
        channel: 'EMAIL',
        status: 'PENDING',
        message: `Your payment of $${(session.amount_total || 0) / 100} has been received.`,
        scheduledFor: new Date(),
      },
    });
  } catch (err) {
    // Log but don't fail the webhook
    console.error('[Webhook] Failed to create notification:', err);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const appointmentId = paymentIntent.metadata?.appointmentId;

  if (!appointmentId) {
    return;
  }

  // Payment handling is primarily done in checkout.session.completed
  // This is a backup handler for edge cases
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const appointmentId = paymentIntent.metadata?.appointmentId;

  if (!appointmentId) {
    return;
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      paymentStatus: 'FAILED',
    },
  });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const appointmentId = charge.metadata?.appointmentId;

  if (!appointmentId) {
    return;
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      paymentStatus: 'REFUNDED',
    },
  });
}
