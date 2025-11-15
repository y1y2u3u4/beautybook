import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

/**
 * POST /api/deposits/create
 * Create a deposit payment intent for an appointment
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { appointmentId, userId } = body;

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        provider: { include: { providerProfile: true } },
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (appointment.customerId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if deposit is required
    if (!appointment.depositRequired || !appointment.depositAmount) {
      return NextResponse.json(
        { error: 'Deposit not required for this appointment' },
        { status: 400 }
      );
    }

    // Check if deposit already paid
    if (appointment.depositPaid) {
      return NextResponse.json(
        { error: 'Deposit already paid' },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(appointment.depositAmount * 100), // Convert to cents
      currency: 'usd',
      customer: appointment.customer.clerkId, // Or Stripe customer ID
      metadata: {
        appointmentId: appointment.id,
        type: 'deposit',
        providerId: appointment.providerId,
        serviceId: appointment.serviceId,
      },
      description: `Deposit for ${appointment.service.name} - ${appointment.provider.providerProfile.businessName}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: appointment.depositAmount,
    });
  } catch (error: any) {
    console.error('[API] Failed to create deposit payment:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to create deposit payment' },
      { status: 500 }
    );
  }
}
