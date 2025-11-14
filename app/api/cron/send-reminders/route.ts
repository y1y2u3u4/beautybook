import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentReminder } from '@/lib/email';
import { sendAppointmentReminderSMS } from '@/lib/sms';

export const dynamic = 'force-dynamic';

/**
 * Cron job endpoint to send appointment reminders 24 hours before
 *
 * This endpoint should be called by a cron job once per hour to check for
 * appointments happening in the next 24-25 hours and send reminders.
 *
 * In Vercel, configure this in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-reminders",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 *
 * For security, you can add an authorization header check:
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    console.log('Checking for appointments between', tomorrow, 'and', dayAfterTomorrow);

    // Find appointments happening in 24-25 hours that are confirmed/scheduled
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        status: {
          in: ['CONFIRMED', 'SCHEDULED'],
        },
        paymentStatus: 'PAID',
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

    console.log(`Found ${upcomingAppointments.length} appointments to remind`);

    let emailsSent = 0;
    let smsSent = 0;
    const errors: string[] = [];

    // Send reminders for each appointment
    for (const appointment of upcomingAppointments) {
      try {
        const customerName =
          appointment.customer.firstName && appointment.customer.lastName
            ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
            : appointment.customer.email;

        const providerName = appointment.provider.businessName;

        // Format date
        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        });

        // Send email reminder
        try {
          await sendAppointmentReminder({
            customerEmail: appointment.customer.email,
            customerName,
            providerName,
            serviceName: appointment.service.name,
            date: formattedDate,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            amount: appointment.amount,
            appointmentId: appointment.id,
          });
          emailsSent++;
          console.log(`Email reminder sent for appointment ${appointment.id}`);
        } catch (emailError: any) {
          console.error(`Error sending email reminder for ${appointment.id}:`, emailError);
          errors.push(`Email failed for ${appointment.id}: ${emailError.message}`);
        }

        // Send SMS reminder if phone number exists
        if (appointment.customer.customerProfile?.phone) {
          try {
            await sendAppointmentReminderSMS({
              customerPhone: appointment.customer.customerProfile.phone,
              customerName,
              providerName,
              serviceName: appointment.service.name,
              date: formattedDate,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              amount: appointment.amount,
              appointmentId: appointment.id,
            });
            smsSent++;
            console.log(`SMS reminder sent for appointment ${appointment.id}`);
          } catch (smsError: any) {
            console.error(`Error sending SMS reminder for ${appointment.id}:`, smsError);
            errors.push(`SMS failed for ${appointment.id}: ${smsError.message}`);
          }
        }
      } catch (error: any) {
        console.error(`Error processing appointment ${appointment.id}:`, error);
        errors.push(`Processing failed for ${appointment.id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      appointmentsChecked: upcomingAppointments.length,
      emailsSent,
      smsSent,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in reminder cron job:', error);
    return NextResponse.json(
      {
        error: 'Failed to send reminders',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
