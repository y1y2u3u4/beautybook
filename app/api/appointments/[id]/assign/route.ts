import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/appointments/[id]/assign - Assign appointment to staff
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
    const { staffId } = body;

    // Verify appointment belongs to this provider
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment || appointment.providerId !== user.providerProfile.id) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // If staffId provided, verify staff belongs to this provider
    if (staffId) {
      const staff = await prisma.staff.findUnique({
        where: { id: staffId },
      });

      if (!staff || staff.providerId !== user.providerProfile.id) {
        return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
      }

      if (!staff.active) {
        return NextResponse.json({ error: 'Staff is inactive' }, { status: 400 });
      }
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        assignedToId: staffId || null,
      },
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
    console.error('Error assigning appointment:', error);
    return NextResponse.json({ error: 'Failed to assign appointment' }, { status: 500 });
  }
}
