import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/payment-methods/[id]/default - Set default payment method
export async function PATCH(
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

    if (!user || !user.customerProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Update default payment method
    await prisma.customerProfile.update({
      where: { id: user.customerProfile.id },
      data: {
        stripePaymentMethodId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    );
  }
}
