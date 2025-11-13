import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper function to check if two time ranges overlap
function checkTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Convert time strings like "10:00 AM" to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = minutes;

    if (period === 'PM' && hours !== 12) {
      totalMinutes += (hours + 12) * 60;
    } else if (period === 'AM' && hours === 12) {
      totalMinutes += 0;
    } else {
      totalMinutes += hours * 60;
    }

    return totalMinutes;
  };

  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);

  // Check overlap: start1 < end2 AND start2 < end1
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

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

      // Check for time conflicts
      const appointmentDate = new Date(appointment.date);
      appointmentDate.setHours(0, 0, 0, 0);

      const existingAppointments = await prisma.appointment.findMany({
        where: {
          assignedToId: staffId,
          date: {
            gte: appointmentDate,
            lt: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000),
          },
          status: {
            notIn: ['CANCELLED'],
          },
          id: {
            not: params.id, // Exclude current appointment
          },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          service: {
            select: {
              name: true,
            },
          },
        },
      });

      // Check if there's a time conflict
      if (existingAppointments.length > 0) {
        const conflicts = existingAppointments.filter((existing) => {
          return checkTimeOverlap(
            appointment.startTime,
            appointment.endTime,
            existing.startTime,
            existing.endTime
          );
        });

        if (conflicts.length > 0) {
          const conflictDetails = conflicts.map((c) => ({
            time: `${c.startTime} - ${c.endTime}`,
            service: c.service.name,
          }));

          return NextResponse.json(
            {
              error: 'Time conflict detected',
              message: `该员工在此时间段已有预约：${conflictDetails[0].time} (${conflictDetails[0].service})`,
              conflicts: conflictDetails,
            },
            { status: 409 }
          );
        }
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
