import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { sendAppointmentConfirmation } from '@/lib/email';

// Initialize Stripe
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-10-29.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Update appointment payment status
        await prisma.appointment.updateMany({
          where: {
            paymentId: session.id,
          },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          },
        });

        console.log('Payment successful for session:', session.id);

        // Send confirmation email
        try {
          // Get appointment details with related data
          const appointment = await prisma.appointment.findFirst({
            where: {
              paymentId: session.id,
            },
            include: {
              customer: true,
              provider: {
                include: {
                  user: true,
                },
              },
              service: true,
            },
          });

          if (appointment) {
            const customerName =
              appointment.customer.firstName && appointment.customer.lastName
                ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
                : appointment.customer.email;

            const providerName = appointment.provider.businessName;

            // Format date
            const appointmentDate = new Date(appointment.date);
            const formattedDate = appointmentDate.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            });

            await sendAppointmentConfirmation({
              customerEmail: appointment.customer.email,
              customerName,
              providerName,
              serviceName: appointment.service.name,
              date: formattedDate,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              amount: appointment.amount,
              appointmentId: appointment.id,
            });

            console.log('Confirmation email sent successfully');
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }

        // TODO: Create Google Calendar event

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Cancel the appointment if payment expired
        await prisma.appointment.updateMany({
          where: {
            paymentId: session.id,
          },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
          },
        });

        console.log('Payment expired for session:', session.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
}
