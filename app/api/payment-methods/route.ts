import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-10-29.clover',
  });
}

// GET /api/payment-methods - Get user's saved payment methods
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        customerProfile: true,
      },
    });

    if (!user || !user.customerProfile?.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    const stripe = getStripe();

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.customerProfile.stripeCustomerId,
      type: 'card',
    });

    // Format payment methods for response
    const formattedMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: pm.id === user.customerProfile?.stripePaymentMethodId,
    }));

    return NextResponse.json({ paymentMethods: formattedMethods });
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// DELETE /api/payment-methods/[id] - Delete a payment method
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        customerProfile: true,
      },
    });

    if (!user || !user.customerProfile?.stripeCustomerId) {
      return NextResponse.json({ error: 'No payment methods found' }, { status: 404 });
    }

    const stripe = getStripe();

    // Detach payment method from customer
    await stripe.paymentMethods.detach(params.id);

    // If this was the default payment method, clear it
    if (user.customerProfile.stripePaymentMethodId === params.id) {
      await prisma.customerProfile.update({
        where: { id: user.customerProfile.id },
        data: {
          stripePaymentMethodId: null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
