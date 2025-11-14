import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { updateCalendarEvent } from '@/lib/calendar';
import { sendAppointmentReschedule } from '@/lib/email';
import { sendAppointmentRescheduleSMS } from '@/lib/sms';

export const dynamic = 'force-dynamic';

// POST /api/appointments/[id]/reschedule - Reschedule an appointment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, startTime, endTime } = body;

    // Validate input
    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Date, start time, and end time are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current appointment with full details
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
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
        assignedTo: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Verify user owns this appointment (customer only can reschedule)
    const isCustomer = appointment.customerId === user.id;

    if (!isCustomer) {
      return NextResponse.json(
        { error: 'Only the customer can reschedule appointments' },
        { status: 403 }
      );
    }

    // Check if already cancelled or completed
    if (appointment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot reschedule cancelled appointments' },
        { status: 400 }
      );
    }

    if (appointment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot reschedule completed appointments' },
        { status: 400 }
      );
    }

    // Parse the new date
    const newDate = new Date(date);
    const now = new Date();

    // Check if new date is in the past
    if (newDate < now) {
      return NextResponse.json(
        { error: 'Cannot reschedule to a past date' },
        { status: 400 }
      );
    }

    // Check if the new time slot is at least 2 hours in the future
    const hoursUntilAppointment = (newDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilAppointment < 2) {
      return NextResponse.json(
        { error: 'Appointments must be scheduled at least 2 hours in advance' },
        { status: 400 }
      );
    }

    // Check for conflicts with existing appointments at the new time
    const conflicts = await prisma.appointment.findMany({
      where: {
        providerId: appointment.providerId,
        date: newDate,
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
        id: {
          not: appointment.id, // Exclude current appointment
        },
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
            // New appointment completely overlaps existing appointment
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose another time.' },
        { status: 409 }
      );
    }

    // Store old appointment details for notifications
    const oldDate = appointment.date;
    const oldStartTime = appointment.startTime;
    const oldEndTime = appointment.endTime;

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        date: newDate,
        startTime,
        endTime,
        status: 'SCHEDULED', // Reset to scheduled since it's been modified
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
        assignedTo: true,
      },
    });

    // Update Google Calendar event if exists
    if (appointment.googleEventId) {
      try {
        await updateCalendarEvent(appointment.googleEventId, {
          appointmentId: updatedAppointment.id,
          customerName:
            updatedAppointment.customer.firstName && updatedAppointment.customer.lastName
              ? `${updatedAppointment.customer.firstName} ${updatedAppointment.customer.lastName}`
              : updatedAppointment.customer.email,
          customerEmail: updatedAppointment.customer.email,
          providerName: updatedAppointment.provider.businessName,
          serviceName: updatedAppointment.service.name,
          date: newDate,
          startTime,
          endTime,
          amount: updatedAppointment.amount,
          notes: updatedAppointment.notes || undefined,
        });
        console.log('Google Calendar event updated:', appointment.googleEventId);
      } catch (calendarError) {
        console.error('Error updating calendar event:', calendarError);
        // Continue even if calendar update fails
      }
    }

    // Send reschedule notifications
    try {
      const customerName =
        updatedAppointment.customer.firstName && updatedAppointment.customer.lastName
          ? `${updatedAppointment.customer.firstName} ${updatedAppointment.customer.lastName}`
          : updatedAppointment.customer.email;

      const providerName = updatedAppointment.provider.businessName;

      // Format dates
      const oldFormattedDate = new Date(oldDate).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });

      const newFormattedDate = newDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });

      // Send email notification
      await sendAppointmentReschedule({
        customerEmail: updatedAppointment.customer.email,
        customerName,
        providerName,
        serviceName: updatedAppointment.service.name,
        oldDate: oldFormattedDate,
        oldStartTime,
        oldEndTime,
        newDate: newFormattedDate,
        newStartTime: startTime,
        newEndTime: endTime,
        amount: updatedAppointment.amount,
        appointmentId: updatedAppointment.id,
      });

      console.log('Reschedule email sent successfully');

      // Send SMS notification if phone number exists
      if (updatedAppointment.customer.customerProfile?.phone) {
        try {
          await sendAppointmentRescheduleSMS({
            customerPhone: updatedAppointment.customer.customerProfile.phone,
            customerName,
            providerName,
            serviceName: updatedAppointment.service.name,
            oldDate: oldFormattedDate,
            oldStartTime,
            oldEndTime,
            newDate: newFormattedDate,
            newStartTime: startTime,
            newEndTime: endTime,
            amount: updatedAppointment.amount,
            appointmentId: updatedAppointment.id,
          });
          console.log('Reschedule SMS sent successfully');
        } catch (smsError) {
          console.error('Error sending reschedule SMS:', smsError);
          // Don't fail the reschedule if SMS fails
        }
      }
    } catch (emailError) {
      console.error('Error sending reschedule email:', emailError);
      // Don't fail the reschedule if email fails
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: 'Appointment rescheduled successfully',
    });
  } catch (error: any) {
    console.error('Error rescheduling appointment:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule appointment' },
      { status: 500 }
    );
  }
}
