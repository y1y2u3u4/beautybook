import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  : null;

// Check if Stripe is configured
export const isStripeConfigured = (): boolean => {
  return !!stripe;
};

// Payment types
export interface CreatePaymentIntentParams {
  amount: number; // in cents
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

// Create a payment intent
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentResult> {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured' };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency || 'usd',
      metadata: params.metadata || {},
      description: params.description,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || undefined,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create payment intent';
    return { success: false, error: message };
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return null;
  }
}

// Format amount for display
export function formatStripeAmount(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

// Calculate deposit amount (default 20%)
export function calculateDepositAmount(totalAmount: number, depositPercentage: number = 20): number {
  return Math.round(totalAmount * (depositPercentage / 100));
}
