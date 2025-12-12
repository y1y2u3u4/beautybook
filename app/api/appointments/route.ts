import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/scheduler';

/**
 * GET /api/appointments
 * Get appointments for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role') || 'customer'; // 'customer' or 'provider'

    // Build where clause based on role
    let whereClause: any = {};

    if (role === 'provider') {
      // Get provider profile
      const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: user.id },
      });

      if (!providerProfile) {
        return NextResponse.json(
          { error: 'Provider profile not found' },
          { status: 404 }
        );
      }

      whereClause.providerId = providerProfile.id;
    } else {
      whereClause.customerId = user.id;
    }

    if (status) {
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
            phone: true,
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

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error('[API] Failed to get appointments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get appointments' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please complete your profile first.' },
        { status: 404 }
      );
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
    if (!providerId || !serviceId || !date || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields: providerId, serviceId, date, startTime' },
        { status: 400 }
      );
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    if (!service.active) {
      return NextResponse.json(
        { error: 'Service is no longer available' },
        { status: 400 }
      );
    }

    // Verify provider matches
    if (service.providerId !== providerId) {
      return NextResponse.json(
        { error: 'Service does not belong to the specified provider' },
        { status: 400 }
      );
    }

    // Calculate end time based on service duration
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + service.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    // Check for conflicting appointments
    const appointmentDate = new Date(date);
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        providerId,
        date: appointmentDate,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        OR: [
          {
            // New appointment starts during existing appointment
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            // New appointment ends during existing appointment
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            // New appointment encompasses existing appointment
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      );
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
        depositRequired: service.price >= 100, // Require deposit for services $100+
        depositAmount: service.price >= 100 ? service.price * 0.2 : null, // 20% deposit
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

    // Schedule confirmation notification
    try {
      await createNotification({
        userId: user.id,
        appointmentId: appointment.id,
        type: 'APPOINTMENT_CONFIRMED',
        channel: 'EMAIL',
        scheduledFor: new Date(),
      });

      // Schedule reminder notifications
      const appointmentDateTime = new Date(appointmentDate);
      const [apptHours, apptMinutes] = startTime.split(':').map(Number);
      appointmentDateTime.setHours(apptHours, apptMinutes);

      // 24 hours before
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

      // 2 hours before
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
      console.error('[API] Failed to create notifications:', notificationError);
      // Don't fail the appointment creation if notifications fail
    }

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Appointment booked successfully',
    });
  } catch (error: any) {
    console.error('[API] Failed to create appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
