import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/appointments/[id]/status - Update appointment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user?.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify appointment belongs to this provider
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment || appointment.providerId !== user.providerProfile.id) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { status },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        service: true,
        assignedTo: true,
      },
    });

    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
    return NextResponse.json({ error: 'Failed to update appointment status' }, { status: 500 });
  }
}
