import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// DELETE /api/waitlist/[id] - Cancel waitlist entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get waitlist entry
    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id: params.id },
    });

    if (!waitlistEntry) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
    }

    // Verify user owns this waitlist entry
    if (waitlistEntry.customerId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this waitlist entry' },
        { status: 403 }
      );
    }

    // Update status to cancelled
    await prisma.waitlist.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Waitlist entry cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to cancel waitlist entry' },
      { status: 500 }
    );
  }
}
