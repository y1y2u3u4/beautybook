import { NextRequest, NextResponse } from 'next/server';
import { scheduleAppointmentReminders, createNotification } from '@/lib/notifications/scheduler';

/**
 * POST /api/notifications/schedule
 * Schedule notifications for an appointment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, type, userId, channel, scheduledFor } = body;

    // Schedule appointment reminders
    if (appointmentId && type === 'appointment_reminders') {
      const result = await scheduleAppointmentReminders(appointmentId);
      return NextResponse.json(result);
    }

    // Create custom notification
    if (userId && type && channel && scheduledFor) {
      const notification = await createNotification({
        userId,
        appointmentId,
        type,
        channel,
        scheduledFor: new Date(scheduledFor),
        data: body.data,
      });

      return NextResponse.json({ notification });
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API] Failed to schedule notification:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to schedule notification' },
      { status: 500 }
    );
  }
}
