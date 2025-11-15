import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCancellationFee } from '@/lib/cancellation/policy';
import { createNotification } from '@/lib/notifications/scheduler';

/**
 * POST /api/appointments/[id]/cancel
 * Cancel an appointment with optional refund/fee calculation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, reason } = body;

    // Get appointment with all related data
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        provider: { include: { cancellationRules: true } },
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized
    if (appointment.customerId !== userId && appointment.provider.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if appointment is already cancelled
    if (appointment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Appointment is already cancelled' },
        { status: 400 }
      );
    }

    // Calculate appointment datetime
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes);

    // Get cancellation rule
    const cancellationRule = appointment.provider.cancellationRules.find(r => r.active);

    // Calculate cancellation fee
    const feeResult = calculateCancellationFee(
      appointment.cancellationPolicy,
      appointmentDateTime,
      appointment.amount,
      cancellationRule?.hoursBeforeAppt,
      cancellationRule?.feePercentage
    );

    if (!feeResult.canCancel) {
      return NextResponse.json(
        { error: feeResult.reason },
        { status: 400 }
      );
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: reason,
        cancellationFee: feeResult.feeAmount,
        cancellationFeePaid: false,
      },
    });

    // Send cancellation notification
    await createNotification({
      userId: appointment.customerId,
      appointmentId: appointment.id,
      type: 'APPOINTMENT_CANCELLED',
      channel: 'EMAIL',
      scheduledFor: new Date(),
    });

    // Cancel pending reminders
    await prisma.notification.updateMany({
      where: {
        appointmentId: appointment.id,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      cancellationFee: {
        amount: feeResult.feeAmount,
        percentage: feeResult.feePercentage,
        reason: feeResult.reason,
      },
      refundAmount: appointment.amount - feeResult.feeAmount,
    });
  } catch (error: any) {
    console.error('[API] Failed to cancel appointment:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
