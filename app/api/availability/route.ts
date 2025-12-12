import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/availability
 * Get available time slots for a provider on a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');

    if (!providerId || !date) {
      return NextResponse.json(
        { error: 'providerId and date are required' },
        { status: 400 }
      );
    }

    // Get service duration if serviceId provided
    let serviceDuration = 60; // Default 60 minutes
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (service) {
        serviceDuration = service.duration;
      }
    }

    // Parse the date
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Get provider's availability for this day of week
    const availability = await prisma.availability.findFirst({
      where: {
        providerId,
        dayOfWeek,
        active: true,
      },
    });

    if (!availability) {
      return NextResponse.json({
        available: false,
        message: 'Provider is not available on this day',
        slots: [],
      });
    }

    // Get existing appointments for this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        providerId,
        date: requestedDate,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate time slots
    const slots: { time: string; available: boolean }[] = [];
    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Generate 30-minute slots
    for (let mins = startMinutes; mins + serviceDuration <= endMinutes; mins += 30) {
      const hours = Math.floor(mins / 60);
      const minutes = mins % 60;
      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      const slotEndMins = mins + serviceDuration;
      const slotEndHours = Math.floor(slotEndMins / 60);
      const slotEndMinutes = slotEndMins % 60;
      const endTimeStr = `${String(slotEndHours).padStart(2, '0')}:${String(slotEndMinutes).padStart(2, '0')}`;

      // Check if this slot conflicts with any existing appointment
      const isConflict = existingAppointments.some((appt) => {
        const [apptStartH, apptStartM] = appt.startTime.split(':').map(Number);
        const [apptEndH, apptEndM] = appt.endTime.split(':').map(Number);
        const apptStartMins = apptStartH * 60 + apptStartM;
        const apptEndMins = apptEndH * 60 + apptEndM;

        // Check for overlap
        return (mins < apptEndMins && slotEndMins > apptStartMins);
      });

      // Check if the slot is in the past (for today)
      const now = new Date();
      const isToday = requestedDate.toDateString() === now.toDateString();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const isPast = isToday && mins <= currentMins;

      slots.push({
        time: timeStr,
        available: !isConflict && !isPast,
      });
    }

    return NextResponse.json({
      available: true,
      date: date,
      providerId,
      businessHours: {
        start: availability.startTime,
        end: availability.endTime,
      },
      slots,
    });
  } catch (error: any) {
    console.error('[API] Failed to get availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get availability' },
      { status: 500 }
    );
  }
}
