import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Check if database is available
async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  if (!stripe) {
    console.log('[Webhook] Stripe not configured');
    return NextResponse.json({ received: true, mode: 'demo' });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(body) as Stripe.Event;
      console.log('[Webhook] No webhook secret configured - parsing event directly');
    }
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    console.log('[Webhook] Database unavailable - acknowledging event');
    return NextResponse.json({ received: true, database: 'unavailable' });
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
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error processing event:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const appointmentId = session.metadata?.appointmentId;
  const paymentType = session.metadata?.paymentType;

  if (!appointmentId) {
    console.log('[Webhook] No appointmentId in checkout session metadata');
    return;
  }

  console.log(`[Webhook] Processing checkout completed for appointment: ${appointmentId}`);

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

    console.log(`[Webhook] Deposit marked as paid for appointment: ${appointmentId}`);
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

    console.log(`[Webhook] Full payment marked as paid for appointment: ${appointmentId}`);
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
    console.error('[Webhook] Failed to create notification:', err);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const appointmentId = paymentIntent.metadata?.appointmentId;

  if (!appointmentId) {
    console.log('[Webhook] No appointmentId in payment intent metadata');
    return;
  }

  console.log(`[Webhook] Payment succeeded for appointment: ${appointmentId}`);

  // Payment handling is done in checkout.session.completed
  // This is a backup handler
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const appointmentId = paymentIntent.metadata?.appointmentId;

  if (!appointmentId) {
    console.log('[Webhook] No appointmentId in payment intent metadata');
    return;
  }

  console.log(`[Webhook] Payment failed for appointment: ${appointmentId}`);

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
    console.log('[Webhook] No appointmentId in charge metadata');
    return;
  }

  console.log(`[Webhook] Charge refunded for appointment: ${appointmentId}`);

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      paymentStatus: 'REFUNDED',
    },
  });
}
