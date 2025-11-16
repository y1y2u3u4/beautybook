import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerSlug, serviceId, date, time, customerInfo } = body;

    // Validate required fields
    if (!providerSlug || !serviceId || !date || !time || !customerInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, notes } = customerInfo;

    if (!firstName || !email || !phone) {
      return NextResponse.json(
        { error: 'Customer information incomplete' },
        { status: 400 }
      );
    }

    // Find provider by slug
    const provider = await prisma.providerProfile.findUnique({
      where: {
        bookingSlug: providerSlug,
      },
      include: {
        user: true,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if public booking is enabled
    if (!provider.publicBookingEnabled) {
      return NextResponse.json(
        { error: 'Public booking is not available for this provider' },
        { status: 403 }
      );
    }

    // Find or create customer user
    let customerUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!customerUser) {
      // Create a new user account for the guest customer
      customerUser = await prisma.user.create({
        data: {
          clerkId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email,
          firstName,
          lastName: lastName || '',
          role: 'CUSTOMER',
          customerProfile: {
            create: {
              phone,
            },
          },
        },
      });
    }

    // Find service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Parse date and time
    const appointmentDate = new Date(date);
    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }

    const startTime = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const endHour = hour24 + Math.floor(service.duration / 60);
    const endMinute = (minutes + (service.duration % 60)) % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

    // Create appointment with SCHEDULED status
    const appointment = await prisma.appointment.create({
      data: {
        customerId: customerUser.id,
        providerId: provider.id,
        serviceId: service.id,
        date: appointmentDate,
        startTime,
        endTime,
        status: 'SCHEDULED', // Provider needs to confirm
        notes: notes || null,
        amount: service.price,
        paymentStatus: 'PENDING',
      },
      include: {
        service: true,
        customer: true,
        provider: {
          include: {
            user: true,
          },
        },
      },
    });

    // TODO: Send confirmation email to customer
    // TODO: Send notification to provider about new booking request

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        service: appointment.service.name,
        provider: appointment.provider.businessName,
        status: appointment.status,
      },
      message: 'Booking request submitted successfully. You will receive a confirmation email once the provider approves.',
    });
  } catch (error) {
    console.error('Error creating guest booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
