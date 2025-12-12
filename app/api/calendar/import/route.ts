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
        let customerId: string | undefined = undefined;
        if (event.customerEmail) {
          let customer = await prisma.user.findUnique({
            where: { email: event.customerEmail },
          });

          if (!customer && event.customerName) {
            // Create a placeholder customer with a generated clerkId
            const nameParts = event.customerName.split(' ');
            customer = await prisma.user.create({
              data: {
                clerkId: `import_${Date.now()}_${Math.random().toString(36).slice(2)}`,
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

        // Require either a customer or skip import
        if (!customerId) {
          results.errors.push(`Skipped "${event.title}": No customer associated`);
          results.skipped++;
          continue;
        }

        // Require a service to be assigned
        if (!event.serviceId) {
          results.errors.push(`Skipped "${event.title}": No service assigned`);
          results.skipped++;
          continue;
        }

        // Create the appointment
        await prisma.appointment.create({
          data: {
            providerId: user.providerProfile.id,
            customerId: customerId,
            serviceId: event.serviceId,
            staffMemberId: event.staffMemberId || undefined,
            date: dateOnly,
            startTime: startTimeStr,
            endTime: endTimeStr,
            status: 'SCHEDULED',
            notes: `Imported from Google Calendar: ${event.title}\n${event.description || ''}`,
            googleEventId: event.googleEventId,
            amount: 0, // Will be updated when service is assigned
            paymentStatus: 'PENDING',
            cancellationPolicy: 'STANDARD',
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
