import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMockTimeSlots, mockServices } from '@/lib/mock-db';

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

    // Parse the date
    const requestedDate = new Date(date);

    // Try database first, fallback to mock data
    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
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
          source: 'database',
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
        source: 'database',
      });
    }

    // Fallback to mock data
    console.log('[API] Using mock data - database unavailable');

    // Get service duration from mock data
    let serviceDuration = 60;
    if (serviceId) {
      const service = mockServices.find(s => s.id === serviceId);
      if (service) {
        serviceDuration = service.duration;
      }
    }

    const result = getMockTimeSlots(providerId, requestedDate, serviceDuration);

    return NextResponse.json({
      ...result,
      source: 'mock',
    });
  } catch (error: any) {
    console.error('[API] Failed to get availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get availability' },
      { status: 500 }
    );
  }
}
