import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isDatabaseAvailable } from '@/lib/db-utils';
import { handleApiError, createErrorResponse, ValidationError, NotFoundError, UnauthorizedError } from '@/lib/api-utils';
import { validateDate, validateString, validateTimeString } from '@/lib/validation';
import { createNotification } from '@/lib/notifications/scheduler';
import { mockAppointments, mockProviders, mockServices } from '@/lib/mock-db';
import { Prisma, AppointmentStatus } from '@prisma/client';

// Type definitions
interface AppointmentWhereClause {
  customerId?: string;
  providerId?: string;
  status?: AppointmentStatus;
}

/**
 * GET /api/appointments
 * Get appointments for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new UnauthorizedError('Authentication required');
    }

    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const role = searchParams.get('role') || 'customer';

      // Build where clause based on role
      const whereClause: AppointmentWhereClause = {};

      if (role === 'provider') {
        const providerProfile = await prisma.providerProfile.findUnique({
          where: { userId: user.id },
        });

        if (!providerProfile) {
          throw new NotFoundError('Provider profile not found');
        }

        whereClause.providerId = providerProfile.id;
      } else {
        whereClause.customerId = user.id;
      }

      if (status && isValidAppointmentStatus(status)) {
        whereClause.status = status;
      }

      const appointments = await prisma.appointment.findMany({
        where: whereClause,
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
          provider: {
            select: {
              id: true,
              businessName: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              phone: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
              category: true,
            },
          },
          staffMember: {
            select: {
              id: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      // Transform appointments to include startTime/endTime as ISO strings
      const transformedAppointments = appointments.map(apt => ({
        ...apt,
        startTime: new Date(`${apt.date.toISOString().split('T')[0]}T${apt.startTime}:00`).toISOString(),
        endTime: new Date(`${apt.date.toISOString().split('T')[0]}T${apt.endTime}:00`).toISOString(),
        totalPrice: apt.amount,
      }));

      return NextResponse.json({ appointments: transformedAppointments, source: 'database' });
    }

    // Fallback to mock data
    const enrichedAppointments = mockAppointments.map(apt => {
      const provider = mockProviders.find(p => p.id === apt.providerId);
      const service = mockServices.find(s => s.id === apt.serviceId);

      const dateStr = apt.date.toISOString().split('T')[0];
      const startTimeISO = new Date(`${dateStr}T${apt.startTime}:00`).toISOString();
      const endTimeISO = new Date(`${dateStr}T${apt.endTime}:00`).toISOString();

      return {
        id: apt.id,
        status: apt.status,
        startTime: startTimeISO,
        endTime: endTimeISO,
        notes: null,
        totalPrice: service?.price || apt.amount || 0,
        createdAt: new Date().toISOString(),
        provider: provider ? {
          id: provider.id,
          businessName: provider.businessName,
          address: provider.address,
          city: provider.city,
          state: provider.state,
          zipCode: provider.zipCode,
          phone: provider.phone,
          user: {
            firstName: provider.businessName.split(' ')[0],
            lastName: provider.businessName.split(' ').slice(1).join(' '),
          },
        } : null,
        service: service ? {
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price,
        } : null,
      };
    });

    return NextResponse.json({ appointments: enrichedAppointments, source: 'mock' });
  } catch (error) {
    return handleApiError(error, 'Appointments GET');
  }
}

/**
 * POST /api/appointments
 * Create a new appointment
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      throw new NotFoundError('User not found. Please complete your profile first.');
    }

    const body = await request.json();
    const {
      providerId,
      serviceId,
      date,
      startTime,
      notes,
      staffMemberId,
    } = body;

    // Validate required fields
    validateString(providerId, 'providerId', { required: true });
    validateString(serviceId, 'serviceId', { required: true });
    const appointmentDate = validateDate(date, 'date');
    const parsedTime = validateTimeString(startTime, 'startTime', true);

    if (!parsedTime) {
      throw new ValidationError('Invalid start time format');
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    if (!service.active) {
      throw new ValidationError('Service is no longer available');
    }

    if (service.providerId !== providerId) {
      throw new ValidationError('Service does not belong to the specified provider');
    }

    // Calculate end time based on service duration
    const { hours, minutes } = parsedTime;
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + service.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    // Check for conflicting appointments
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        providerId,
        date: appointmentDate,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (existingAppointment) {
      throw new ValidationError('This time slot is no longer available. Please select another time.');
    }

    // Get provider's cancellation policy
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: { cancellationRules: { where: { active: true } } },
    });

    const cancellationPolicy = provider?.cancellationRules[0]?.policy || 'STANDARD';

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerId: user.id,
        providerId,
        serviceId,
        date: appointmentDate,
        startTime,
        endTime,
        status: 'SCHEDULED',
        notes: notes || null,
        amount: service.price,
        paymentStatus: 'PENDING',
        cancellationPolicy,
        depositRequired: service.price >= 100,
        depositAmount: service.price >= 100 ? service.price * 0.2 : null,
        staffMemberId: staffMemberId || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
            address: true,
            city: true,
            state: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    // Schedule notifications (don't fail if this fails)
    try {
      await createNotification({
        userId: user.id,
        appointmentId: appointment.id,
        type: 'APPOINTMENT_CONFIRMED',
        channel: 'EMAIL',
        scheduledFor: new Date(),
      });

      const appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(hours, minutes);

      // 24 hours before reminder
      const reminder24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > new Date()) {
        await createNotification({
          userId: user.id,
          appointmentId: appointment.id,
          type: 'APPOINTMENT_REMINDER',
          channel: 'EMAIL',
          scheduledFor: reminder24h,
        });
      }

      // 2 hours before reminder
      const reminder2h = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
      if (reminder2h > new Date()) {
        await createNotification({
          userId: user.id,
          appointmentId: appointment.id,
          type: 'APPOINTMENT_REMINDER',
          channel: 'SMS',
          scheduledFor: reminder2h,
        });
      }
    } catch (notificationError) {
      // Log but don't fail the appointment creation
      console.error('[Appointments] Failed to create notifications:', notificationError);
    }

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Appointment booked successfully',
    });
  } catch (error) {
    return handleApiError(error, 'Appointments POST');
  }
}

/**
 * Type guard for valid appointment status
 */
function isValidAppointmentStatus(status: string): status is AppointmentStatus {
  return ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status);
}
