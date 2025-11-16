import { prisma } from '@/lib/prisma';
import { sendEmail } from './email';
import { sendSMS } from './sms';
import {
  getAppointmentReminderEmail,
  getAppointmentReminderSMS,
  getAppointmentConfirmationEmail,
  getDepositRequiredEmail,
} from './templates';
import type { NotificationType, NotificationChannel } from '@prisma/client';

export interface CreateNotificationOptions {
  userId: string;
  appointmentId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  scheduledFor: Date;
  data?: any;
}

/**
 * Create a notification in the database
 */
export async function createNotification(options: CreateNotificationOptions) {
  const { userId, appointmentId, type, channel, scheduledFor, data } = options;

  // Get user and appointment data
  const appointment = appointmentId
    ? await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          customer: { include: { customerProfile: true } },
          provider: true,
          service: true,
        },
      })
    : null;

  if (appointmentId && !appointment) {
    throw new Error('Appointment not found');
  }

  // Generate content based on type
  let subject = '';
  let message = '';

  if (appointment) {
    const appointmentData = {
      customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
      providerName: appointment.provider.businessName,
      serviceName: appointment.service.name,
      date: appointment.date,
      time: appointment.startTime,
      address: appointment.provider.address,
      amount: appointment.amount,
    };

    switch (type) {
      case 'APPOINTMENT_REMINDER':
        if (channel === 'EMAIL') {
          const email = getAppointmentReminderEmail(appointmentData);
          subject = email.subject;
          message = email.html;
        } else if (channel === 'SMS') {
          message = getAppointmentReminderSMS(appointmentData);
        }
        break;

      case 'APPOINTMENT_CONFIRMED':
        if (channel === 'EMAIL') {
          const email = getAppointmentConfirmationEmail(appointmentData);
          subject = email.subject;
          message = email.html;
        } else if (channel === 'SMS') {
          message = `Confirmed! Your ${appointmentData.serviceName} appointment with ${appointmentData.providerName} on ${appointmentData.date.toLocaleDateString()} at ${appointmentData.time}.`;
        }
        break;

      case 'DEPOSIT_REQUIRED':
        if (channel === 'EMAIL' && appointment.depositAmount) {
          const email = getDepositRequiredEmail({
            ...appointmentData,
            depositAmount: appointment.depositAmount,
          });
          subject = email.subject;
          message = email.html;
        }
        break;
    }
  }

  // Create notification in database
  const notification = await prisma.notification.create({
    data: {
      userId,
      appointmentId,
      type,
      channel,
      status: 'PENDING',
      subject,
      message,
      data,
      scheduledFor,
    },
  });

  return notification;
}

/**
 * Schedule appointment reminders
 */
export async function scheduleAppointmentReminders(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      customer: { include: { notificationPreference: true } },
    },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  const preference = appointment.customer.notificationPreference;
  const appointmentDateTime = new Date(appointment.date);
  const [hours, minutes] = appointment.startTime.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes);

  const notifications: CreateNotificationOptions[] = [];

  // 24 hour reminder
  if (preference?.reminderBefore24h) {
    const scheduledFor = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);

    if (preference.emailEnabled) {
      notifications.push({
        userId: appointment.customerId,
        appointmentId: appointment.id,
        type: 'APPOINTMENT_REMINDER',
        channel: 'EMAIL',
        scheduledFor,
      });
    }

    if (preference.smsEnabled) {
      notifications.push({
        userId: appointment.customerId,
        appointmentId: appointment.id,
        type: 'APPOINTMENT_REMINDER',
        channel: 'SMS',
        scheduledFor,
      });
    }
  }

  // 2 hour reminder
  if (preference?.reminderBefore2h) {
    const scheduledFor = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);

    if (preference.smsEnabled) {
      notifications.push({
        userId: appointment.customerId,
        appointmentId: appointment.id,
        type: 'APPOINTMENT_REMINDER',
        channel: 'SMS',
        scheduledFor,
      });
    }
  }

  // Create all notifications
  await Promise.all(notifications.map(n => createNotification(n)));

  return { scheduled: notifications.length };
}

/**
 * Send pending notifications that are due
 */
export async function sendPendingNotifications() {
  const now = new Date();

  // Get all pending notifications that are due
  const pendingNotifications = await prisma.notification.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: {
        lte: now,
      },
    },
    include: {
      user: { include: { customerProfile: true } },
      appointment: true,
    },
    take: 100, // Process in batches
  });

  console.log(`[Scheduler] Processing ${pendingNotifications.length} pending notifications`);

  const results = await Promise.allSettled(
    pendingNotifications.map(async (notification) => {
      try {
        let deliveryId: string | undefined;
        let success = false;

        if (notification.channel === 'EMAIL') {
          const result = await sendEmail({
            to: notification.user.email,
            subject: notification.subject || 'Notification',
            html: notification.message,
          });
          success = result.success;
          deliveryId = result.messageId;

          if (!success) {
            throw new Error(result.error);
          }
        } else if (notification.channel === 'SMS') {
          const phone = notification.user.customerProfile?.phone;
          if (!phone) {
            throw new Error('User phone number not found');
          }

          const result = await sendSMS({
            to: phone,
            message: notification.message,
          });
          success = result.success;
          deliveryId = result.messageId;

          if (!success) {
            throw new Error(result.error);
          }
        }

        // Update notification status
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            deliveryId,
          },
        });

        return { id: notification.id, success: true };
      } catch (error: any) {
        console.error(`[Scheduler] Failed to send notification ${notification.id}:`, error);

        // Update notification with error
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'FAILED',
            error: error.message,
          },
        });

        return { id: notification.id, success: false, error: error.message };
      }
    })
  );

  const successCount = results.filter(
    r => r.status === 'fulfilled' && r.value.success
  ).length;
  const failureCount = results.length - successCount;

  console.log(`[Scheduler] Sent ${successCount} notifications, ${failureCount} failed`);

  return { successCount, failureCount, total: results.length };
}
