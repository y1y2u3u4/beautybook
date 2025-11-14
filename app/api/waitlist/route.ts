import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendWaitlistConfirmation } from '@/lib/email';
import { sendWaitlistConfirmationSMS } from '@/lib/sms';

export const dynamic = 'force-dynamic';

// POST /api/waitlist - Add customer to waitlist
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { providerId, serviceId, date, startTime, endTime, flexible = true, notes } = body;

    // Validate input
    if (!providerId || !serviceId || !date) {
      return NextResponse.json(
        { error: 'Provider, service, and date are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { customerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify service and provider exist
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (service.providerId !== providerId) {
      return NextResponse.json(
        { error: 'Service does not belong to this provider' },
        { status: 400 }
      );
    }

    // Parse date
    const waitlistDate = new Date(date);
    const now = new Date();

    // Check if date is in the past
    if (waitlistDate < now) {
      return NextResponse.json(
        { error: 'Cannot join waitlist for past dates' },
        { status: 400 }
      );
    }

    // Check if customer already has an active waitlist entry for this date/service
    const existingWaitlist = await prisma.waitlist.findFirst({
      where: {
        customerId: user.id,
        providerId,
        serviceId,
        date: waitlistDate,
        status: 'ACTIVE',
      },
    });

    if (existingWaitlist) {
      return NextResponse.json(
        { error: 'You are already on the waitlist for this service on this date' },
        { status: 409 }
      );
    }

    // Check if customer already has a booked appointment for this time
    if (startTime && endTime) {
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          customerId: user.id,
          date: waitlistDate,
          startTime,
          endTime,
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
        },
      });

      if (existingAppointment) {
        return NextResponse.json(
          { error: 'You already have an appointment booked for this time' },
          { status: 409 }
        );
      }
    }

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        customerId: user.id,
        providerId,
        serviceId,
        date: waitlistDate,
        startTime: startTime || null,
        endTime: endTime || null,
        flexible,
        notes: notes || null,
        status: 'ACTIVE',
      },
      include: {
        customer: {
          include: {
            customerProfile: true,
          },
        },
        provider: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    });

    // Send confirmation notifications
    try {
      const customerName =
        waitlistEntry.customer.firstName && waitlistEntry.customer.lastName
          ? `${waitlistEntry.customer.firstName} ${waitlistEntry.customer.lastName}`
          : waitlistEntry.customer.email;

      const formattedDate = waitlistDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });

      // Send email confirmation
      await sendWaitlistConfirmation({
        customerEmail: waitlistEntry.customer.email,
        customerName,
        providerName: waitlistEntry.provider.businessName,
        serviceName: waitlistEntry.service.name,
        date: formattedDate,
        startTime: waitlistEntry.startTime || undefined,
        endTime: waitlistEntry.endTime || undefined,
        flexible: waitlistEntry.flexible,
      });

      // Send SMS confirmation if phone number exists
      if (waitlistEntry.customer.customerProfile?.phone) {
        try {
          await sendWaitlistConfirmationSMS({
            customerPhone: waitlistEntry.customer.customerProfile.phone,
            customerName,
            providerName: waitlistEntry.provider.businessName,
            serviceName: waitlistEntry.service.name,
            date: formattedDate,
            startTime: waitlistEntry.startTime || undefined,
            endTime: waitlistEntry.endTime || undefined,
            flexible: waitlistEntry.flexible,
          });
        } catch (smsError) {
          console.error('Error sending waitlist SMS:', smsError);
          // Don't fail if SMS fails
        }
      }
    } catch (emailError) {
      console.error('Error sending waitlist email:', emailError);
      // Don't fail if email fails
    }

    return NextResponse.json({
      success: true,
      waitlistEntry,
      message: 'Added to waitlist successfully. We will notify you when a slot becomes available.',
    });
  } catch (error: any) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to waitlist' },
      { status: 500 }
    );
  }
}

// GET /api/waitlist - Get user's waitlist entries
export async function GET(request: NextRequest) {
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

    // Get waitlist entries
    const waitlistEntries = await prisma.waitlist.findMany({
      where: {
        customerId: user.id,
      },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ waitlistEntries });
  } catch (error: any) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}
