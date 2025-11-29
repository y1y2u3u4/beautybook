import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';

/**
 * POST /api/payments/create
 * Create a payment intent for checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, paymentType, metadata } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const result = await createPaymentIntent({
      amount: Math.round(amount), // Already in cents from frontend
      metadata: {
        paymentType: paymentType || 'full',
        ...metadata,
      },
    });

    if (!result.success) {
      // For demo purposes, return a mock payment intent if Stripe is not configured
      if (result.error === 'Stripe is not configured') {
        return NextResponse.json({
          success: true,
          paymentIntentId: 'demo_pi_' + Date.now(),
          clientSecret: 'demo_secret_' + Date.now(),
          message: 'Demo mode - Stripe not configured',
        });
      }

      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentIntentId: result.paymentIntentId,
      clientSecret: result.clientSecret,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create payment';
    console.error('[API] Payment creation error:', message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
