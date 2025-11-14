import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { sendAppointmentConfirmation } from '@/lib/email';
import { sendAppointmentConfirmationSMS } from '@/lib/sms';
import { createCalendarEvent } from '@/lib/calendar';

// Initialize Stripe
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-10-29.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Update appointment payment status
        await prisma.appointment.updateMany({
          where: {
            paymentId: session.id,
          },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          },
        });

        console.log('Payment successful for session:', session.id);

        // Send confirmation email
        try {
          // Get appointment details with related data
          const appointment = await prisma.appointment.findFirst({
            where: {
              paymentId: session.id,
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

          if (appointment) {
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

            await sendAppointmentConfirmation({
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

            console.log('Confirmation email sent successfully');

            // Send SMS confirmation if phone number exists
            if (appointment.customer.customerProfile?.phone) {
              try {
                await sendAppointmentConfirmationSMS({
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
                console.log('Confirmation SMS sent successfully');
              } catch (smsError) {
                console.error('Error sending confirmation SMS:', smsError);
                // Don't fail the webhook if SMS fails
              }
            }

            // Save payment method for future use
            try {
              if (appointment.customer.customerProfile) {
                const stripe = getStripe();
                // Get payment intent to access payment method
                if (session.payment_intent) {
                  const paymentIntent = await stripe.paymentIntents.retrieve(
                    session.payment_intent as string
                  );

                  if (paymentIntent.payment_method) {
                    let customerId = appointment.customer.customerProfile.stripeCustomerId;

                    // Create Stripe customer if doesn't exist
                    if (!customerId) {
                      const customer = await stripe.customers.create({
                        email: appointment.customer.email,
                        name: customerName,
                        metadata: {
                          userId: appointment.customer.id,
                        },
                      });
                      customerId = customer.id;

                      // Save Stripe customer ID to database
                      await prisma.customerProfile.update({
                        where: { id: appointment.customer.customerProfile.id },
                        data: {
                          stripeCustomerId: customerId,
                        },
                      });
                    }

                    // Attach payment method to customer
                    await stripe.paymentMethods.attach(paymentIntent.payment_method as string, {
                      customer: customerId,
                    });

                    // Set as default payment method if no default exists
                    if (!appointment.customer.customerProfile.stripePaymentMethodId) {
                      await prisma.customerProfile.update({
                        where: { id: appointment.customer.customerProfile.id },
                        data: {
                          stripePaymentMethodId: paymentIntent.payment_method as string,
                        },
                      });

                      // Also set as default in Stripe
                      await stripe.customers.update(customerId, {
                        invoice_settings: {
                          default_payment_method: paymentIntent.payment_method as string,
                        },
                      });
                    }

                    console.log('Payment method saved for customer:', customerId);
                  }
                }
              }
            } catch (paymentMethodError) {
              console.error('Error saving payment method:', paymentMethodError);
              // Don't fail the webhook if saving payment method fails
            }

            // Create Google Calendar event
            try {
              const result = await createCalendarEvent({
                appointmentId: appointment.id,
                customerName,
                customerEmail: appointment.customer.email,
                providerName: appointment.provider.businessName,
                serviceName: appointment.service.name,
                date: appointment.date,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                amount: appointment.amount,
                notes: appointment.notes || undefined,
              });

              // Save the Google event ID to the appointment
              if (result.success && result.eventId) {
                await prisma.appointment.update({
                  where: { id: appointment.id },
                  data: {
                    googleEventId: result.eventId,
                  },
                });
                console.log('Google Calendar event created and saved:', result.eventId);
              }
            } catch (calendarError) {
              console.error('Error creating calendar event:', calendarError);
              // Don't fail the webhook if calendar creation fails
            }

            // Award loyalty points
            try {
              if (appointment.customer.customerProfile) {
                // Calculate points ($1 = 1 point, with tier multiplier)
                const basePoints = Math.floor(appointment.amount);
                let multiplier = 1;

                // Apply tier multiplier
                if (appointment.customer.customerProfile.membershipTier === 'SILVER') multiplier = 1.2;
                else if (appointment.customer.customerProfile.membershipTier === 'GOLD') multiplier = 1.5;
                else if (appointment.customer.customerProfile.membershipTier === 'DIAMOND') multiplier = 2;

                const points = Math.floor(basePoints * multiplier);

                // Calculate new tier
                const currentPoints = appointment.customer.customerProfile.loyaltyPoints;
                const newTotalPoints = currentPoints + points;
                let newTier = appointment.customer.customerProfile.membershipTier;

                if (newTotalPoints >= 5000) newTier = 'DIAMOND';
                else if (newTotalPoints >= 3000) newTier = 'GOLD';
                else if (newTotalPoints >= 1000) newTier = 'SILVER';
                else newTier = 'BRONZE';

                // Update customer profile
                await prisma.customerProfile.update({
                  where: { id: appointment.customer.customerProfile.id },
                  data: {
                    loyaltyPoints: {
                      increment: points,
                    },
                    totalSpent: {
                      increment: appointment.amount,
                    },
                    membershipTier: newTier,
                  },
                });

                // Record transaction
                await prisma.loyaltyTransaction.create({
                  data: {
                    customerProfileId: appointment.customer.customerProfile.id,
                    type: 'EARNED_BOOKING',
                    points,
                    description: `Earned ${points} points from booking`,
                    relatedId: appointment.id,
                  },
                });

                console.log(`Awarded ${points} loyalty points to customer ${appointment.customer.id}`);
              }
            } catch (loyaltyError) {
              console.error('Error awarding loyalty points:', loyaltyError);
              // Don't fail the webhook if loyalty update fails
            }
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Cancel the appointment if payment expired
        await prisma.appointment.updateMany({
          where: {
            paymentId: session.id,
          },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
          },
        });

        console.log('Payment expired for session:', session.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
}
