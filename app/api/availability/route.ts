import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isDatabaseAvailable } from '@/lib/db-utils';
import { handleApiError, ValidationError } from '@/lib/api-utils';
import { validateDate, validateTimeString } from '@/lib/validation';
import { createLogger } from '@/lib/logger';
import { getMockTimeSlots, mockServices } from '@/lib/mock-db';

const logger = createLogger('Availability API');

/**
 * GET /api/availability
 * Get available time slots for a provider on a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const dateParam = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');

    // Validate required parameters
    if (!providerId) {
      throw new ValidationError('providerId is required');
    }

    if (!dateParam) {
      throw new ValidationError('date is required');
    }

    // Parse and validate the date
    const requestedDate = validateDate(dateParam, 'date');

    // Try database first, fallback to mock data
    const dbAvailable = await isDatabaseAvailable();
    let useDatabase = dbAvailable;

    if (useDatabase) {
      try {
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

        // Parse time strings safely
        const startTimeParsed = validateTimeString(availability.startTime, 'startTime', true);
        const endTimeParsed = validateTimeString(availability.endTime, 'endTime', true);

        if (!startTimeParsed || !endTimeParsed) {
          throw new ValidationError('Invalid availability time format');
        }

        // Generate time slots based on availability
        const slots: { time: string; available: boolean }[] = [];
        const startMinutes = startTimeParsed.hours * 60 + startTimeParsed.minutes;
        const endMinutes = endTimeParsed.hours * 60 + endTimeParsed.minutes;

        // Generate 30-minute slots
        for (let mins = startMinutes; mins + serviceDuration <= endMinutes; mins += 30) {
          const hours = Math.floor(mins / 60);
          const minutes = mins % 60;
          const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

          // Check if the slot is in the past (for today)
          const now = new Date();
          const isToday = requestedDate.toDateString() === now.toDateString();
          const currentMins = now.getHours() * 60 + now.getMinutes();
          const isPast = isToday && mins <= currentMins;

          slots.push({
            time: timeStr,
            available: !isPast,
          });
        }

        return NextResponse.json({
          available: true,
          date: dateParam,
          providerId,
          businessHours: {
            start: availability.startTime,
            end: availability.endTime,
          },
          slots,
          source: 'database',
        });
      } catch (dbError) {
        logger.warn('Database query failed, falling back to mock data', {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
        });
        useDatabase = false;
      }
    }

    // Fallback to mock data
    logger.debug('Using mock data - database unavailable');

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
  } catch (error) {
    return handleApiError(error, 'Availability GET');
  }
}
