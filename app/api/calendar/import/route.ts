import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface ImportedEvent {
  googleEventId: string;
  title: string;
  serviceName: string;
  customerName: string;
  customerEmail?: string;
  startTime: string;
  endTime: string;
  date: string;
  duration: number;
  description?: string;
  serviceId?: string;
  staffMemberId?: string;
}

/**
 * POST /api/calendar/import
 * Import Google Calendar events as appointments
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

    // Get provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    if (!user?.providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { events } = body as { events: ImportedEvent[] };

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'No events to import' },
        { status: 400 }
      );
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const event of events) {
      try {
        // Check if already imported
        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            providerId: user.providerProfile.id,
            googleEventId: event.googleEventId,
          },
        });

        if (existingAppointment) {
          results.skipped++;
          continue;
        }

        // Try to find or create a customer
        let customerId: string | null = null;
        if (event.customerEmail) {
          let customer = await prisma.user.findUnique({
            where: { email: event.customerEmail },
          });

          if (!customer && event.customerName) {
            // Create a placeholder customer
            const nameParts = event.customerName.split(' ');
            customer = await prisma.user.create({
              data: {
                email: event.customerEmail,
                firstName: nameParts[0] || 'Unknown',
                lastName: nameParts.slice(1).join(' ') || 'Customer',
                role: 'CUSTOMER',
              },
            });
          }

          if (customer) {
            customerId = customer.id;
          }
        }

        // Parse date and times
        const startDateTime = new Date(event.startTime);
        const endDateTime = new Date(event.endTime);
        const dateOnly = new Date(startDateTime.toISOString().split('T')[0]);
        const startTimeStr = startDateTime.toTimeString().slice(0, 5);
        const endTimeStr = endDateTime.toTimeString().slice(0, 5);

        // Create the appointment
        await prisma.appointment.create({
          data: {
            providerId: user.providerProfile.id,
            customerId: customerId,
            serviceId: event.serviceId || null,
            staffMemberId: event.staffMemberId || null,
            date: dateOnly,
            startTime: startTimeStr,
            endTime: endTimeStr,
            status: 'SCHEDULED',
            notes: `Imported from Google Calendar: ${event.title}\n${event.description || ''}`,
            googleEventId: event.googleEventId,
            amount: 0, // Will be updated when service is assigned
            paymentStatus: 'PENDING',
            cancellationPolicy: 'STANDARD',
            source: 'GOOGLE_CALENDAR',
          },
        });

        results.imported++;
      } catch (err: any) {
        results.errors.push(`Failed to import "${event.title}": ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Imported ${results.imported} events, skipped ${results.skipped} duplicates`,
    });
  } catch (error: any) {
    console.error('[API] Failed to import calendar events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import calendar events' },
      { status: 500 }
    );
  }
}
