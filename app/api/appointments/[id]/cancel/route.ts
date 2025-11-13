import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { sendAppointmentCancellation } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Initialize Stripe
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-10-29.clover',
  });
}

// POST /api/appointments/[id]/cancel - Cancel appointment and process refund
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
    const { reason } = body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get appointment with full details
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        provider: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Verify user owns this appointment (customer) or is the provider
    const isCustomer = appointment.customerId === user.id;
    const isProvider = user.providerProfile && appointment.providerId === user.providerProfile.id;

    if (!isCustomer && !isProvider) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this appointment' },
        { status: 403 }
      );
    }

    // Check if already cancelled
    if (appointment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Appointment is already cancelled' },
        { status: 400 }
      );
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    if (appointmentDate < now && appointment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel completed appointments' },
        { status: 400 }
      );
    }

    // Calculate refund amount based on cancellation policy
    const hoursUntilAppointment =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercentage = 100; // Default: full refund
    let refundReason = '全额退款';

    if (hoursUntilAppointment < 24) {
      // Less than 24 hours: 50% refund
      refundPercentage = 50;
      refundReason = '24小时内取消，退款50%';
    } else if (hoursUntilAppointment < 2) {
      // Less than 2 hours: no refund
      refundPercentage = 0;
      refundReason = '2小时内取消，不予退款';
    }

    const refundAmount = Math.floor((appointment.amount * refundPercentage) / 100);

    // Process Stripe refund if payment was made
    let refundId = null;
    if (appointment.paymentStatus === 'PAID' && appointment.paymentId && refundAmount > 0) {
      try {
        const stripe = getStripe();

        // Get the payment intent from the checkout session
        const session = await stripe.checkout.sessions.retrieve(appointment.paymentId);

        if (session.payment_intent) {
          const refund = await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            amount: Math.floor(refundAmount * 100), // Convert to cents
            reason: 'requested_by_customer',
            metadata: {
              appointmentId: appointment.id,
              cancellationReason: reason || 'No reason provided',
            },
          });

          refundId = refund.id;
          console.log('Refund created:', refund.id, 'Amount:', refundAmount);
        }
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError);
        // Continue with cancellation even if refund fails
        // Admin can manually process refund later
      }
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        notes: reason
          ? `${appointment.notes || ''}\n[取消原因] ${reason}`
          : appointment.notes,
      },
      include: {
        customer: true,
        provider: {
          include: {
            user: true,
          },
        },
        service: true,
        assignedTo: true,
      },
    });

    // Send cancellation email
    try {
      const customerName =
        appointment.customer.firstName && appointment.customer.lastName
          ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
          : appointment.customer.email;

      const providerName = appointment.provider.businessName;

      // Format date
      const formattedDate = appointmentDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });

      await sendAppointmentCancellation({
        customerEmail: appointment.customer.email,
        customerName,
        providerName,
        serviceName: appointment.service.name,
        date: formattedDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        amount: appointment.amount,
        appointmentId: appointment.id,
        reason: reason || undefined,
      });

      console.log('Cancellation email sent successfully');
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      refund: {
        amount: refundAmount,
        percentage: refundPercentage,
        reason: refundReason,
        refundId,
      },
    });
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
