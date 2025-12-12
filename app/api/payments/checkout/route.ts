import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' })
  : null;

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
 * POST /api/payments/checkout
 * Create a Stripe checkout session for an appointment
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { appointmentId, paymentType = 'full' } = body; // 'full' or 'deposit'

    // Check if Stripe is configured
    if (!stripe) {
      // Return demo checkout for development
      return NextResponse.json({
        success: true,
        source: 'demo',
        checkoutUrl: `/checkout/demo?appointmentId=${appointmentId}`,
        message: 'Stripe not configured - using demo checkout',
      });
    }

    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      // Return demo checkout
      return NextResponse.json({
        success: true,
        source: 'demo',
        checkoutUrl: `/checkout/demo?appointmentId=${appointmentId}`,
        message: 'Database unavailable - using demo checkout',
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
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

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (appointment.customerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Determine amount to charge
    let amount: number;
    let description: string;

    if (paymentType === 'deposit') {
      if (!appointment.depositRequired || !appointment.depositAmount) {
        return NextResponse.json(
          { error: 'Deposit not required for this appointment' },
          { status: 400 }
        );
      }

      if (appointment.depositPaid) {
        return NextResponse.json(
          { error: 'Deposit already paid' },
          { status: 400 }
        );
      }

      amount = appointment.depositAmount;
      description = `Deposit for ${appointment.service.name}`;
    } else {
      if (appointment.paymentStatus === 'PAID') {
        return NextResponse.json(
          { error: 'Appointment already paid' },
          { status: 400 }
        );
      }

      amount = appointment.amount;
      description = appointment.service.name;
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description,
              description: `${appointment.provider.businessName} - ${new Date(appointment.date).toLocaleDateString()} at ${appointment.startTime}`,
              images: appointment.provider.user?.imageUrl
                ? [appointment.provider.user.imageUrl]
                : undefined,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointment.id}`,
      cancel_url: `${baseUrl}/checkout/cancel?appointment_id=${appointment.id}`,
      customer_email: appointment.customer.email,
      metadata: {
        appointmentId: appointment.id,
        customerId: appointment.customerId,
        providerId: appointment.providerId,
        serviceId: appointment.serviceId,
        paymentType,
      },
    });

    return NextResponse.json({
      success: true,
      source: 'stripe',
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('[API] Failed to create checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/checkout
 * Get payment status for an appointment
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Missing appointmentId' },
        { status: 400 }
      );
    }

    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return NextResponse.json({
        paymentStatus: 'PENDING',
        depositPaid: false,
        amount: 0,
        source: 'mock',
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        provider: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (appointment.customerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      paymentStatus: appointment.paymentStatus,
      depositRequired: appointment.depositRequired,
      depositAmount: appointment.depositAmount,
      depositPaid: appointment.depositPaid,
      amount: appointment.amount,
      service: {
        name: appointment.service.name,
        price: appointment.service.price,
      },
      provider: {
        businessName: appointment.provider.businessName,
      },
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to get payment status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
