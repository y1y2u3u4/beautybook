import { formatDate } from '@/lib/utils';

export interface AppointmentData {
  customerName: string;
  providerName: string;
  serviceName: string;
  date: Date;
  time: string;
  address: string;
  amount: number;
}

export function getAppointmentReminderEmail(data: AppointmentData): {
  subject: string;
  html: string;
  text: string;
} {
  const formattedDate = formatDate(data.date);

  return {
    subject: `Reminder: Your appointment tomorrow at ${data.time}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec4899; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Appointment Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${data.customerName},</p>
              <p>This is a friendly reminder about your upcoming appointment.</p>

              <div class="appointment-card">
                <div class="detail-row">
                  <span class="label">Service:</span>
                  <span class="value">${data.serviceName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Provider:</span>
                  <span class="value">${data.providerName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date & Time:</span>
                  <span class="value">${formattedDate} at ${data.time}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Location:</span>
                  <span class="value">${data.address}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Amount:</span>
                  <span class="value">$${data.amount.toFixed(2)}</span>
                </div>
              </div>

              <p><strong>Please arrive 10 minutes early.</strong></p>

              <p>Need to reschedule? No problem! Just let us know at least 24 hours in advance to avoid cancellation fees.</p>

              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments" class="button">View Appointment Details</a>
              </center>

              <div class="footer">
                <p>BeautyBook - Your trusted beauty booking platform</p>
                <p>If you have any questions, please contact us.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Appointment Reminder

Hi ${data.customerName},

This is a friendly reminder about your upcoming appointment:

Service: ${data.serviceName}
Provider: ${data.providerName}
Date & Time: ${formattedDate} at ${data.time}
Location: ${data.address}
Amount: $${data.amount.toFixed(2)}

Please arrive 10 minutes early.

Need to reschedule? Let us know at least 24 hours in advance to avoid cancellation fees.

View details: ${process.env.NEXT_PUBLIC_APP_URL}/appointments

BeautyBook - Your trusted beauty booking platform
    `.trim(),
  };
}

export function getAppointmentReminderSMS(data: AppointmentData): string {
  const formattedDate = formatDate(data.date);

  return `Hi ${data.customerName}! Reminder: Your ${data.serviceName} appointment with ${data.providerName} is tomorrow at ${data.time}. ${data.address}. See you soon!`;
}

export function getAppointmentConfirmationEmail(data: AppointmentData): {
  subject: string;
  html: string;
  text: string;
} {
  const formattedDate = formatDate(data.date);

  return {
    subject: `Appointment Confirmed - ${formattedDate}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1>✅ Appointment Confirmed!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi ${data.customerName},</p>
              <p>Great news! Your appointment has been confirmed.</p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Provider:</strong> ${data.providerName}</p>
                <p><strong>Date & Time:</strong> ${formattedDate} at ${data.time}</p>
                <p><strong>Location:</strong> ${data.address}</p>
                <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
              </div>

              <p>We're looking forward to seeing you!</p>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Manage Appointment</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Appointment Confirmed!

Hi ${data.customerName},

Your appointment has been confirmed:

Service: ${data.serviceName}
Provider: ${data.providerName}
Date & Time: ${formattedDate} at ${data.time}
Location: ${data.address}
Amount: $${data.amount.toFixed(2)}

We're looking forward to seeing you!

Manage appointment: ${process.env.NEXT_PUBLIC_APP_URL}/appointments
    `.trim(),
  };
}

export function getDepositRequiredEmail(data: AppointmentData & { depositAmount: number }): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Action Required: Deposit Payment for Your Appointment`,
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1>💳 Deposit Required</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi ${data.customerName},</p>
              <p>To confirm your appointment, please pay the required deposit of <strong>$${data.depositAmount.toFixed(2)}</strong>.</p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Provider:</strong> ${data.providerName}</p>
                <p><strong>Date & Time:</strong> ${formatDate(data.date)} at ${data.time}</p>
                <p><strong>Total Amount:</strong> $${data.amount.toFixed(2)}</p>
                <p><strong>Deposit Required:</strong> $${data.depositAmount.toFixed(2)}</p>
                <p><strong>Remaining Balance:</strong> $${(data.amount - data.depositAmount).toFixed(2)}</p>
              </div>

              <p>The deposit will be deducted from your total amount. The remaining balance can be paid after your appointment.</p>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments/pay-deposit" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Pay Deposit Now</a>
              </p>

              <p style="color: #666; font-size: 12px; margin-top: 20px;">Note: Your appointment will be confirmed once the deposit is received.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Deposit Required

Hi ${data.customerName},

To confirm your appointment, please pay the required deposit of $${data.depositAmount.toFixed(2)}.

Service: ${data.serviceName}
Provider: ${data.providerName}
Date & Time: ${formatDate(data.date)} at ${data.time}
Total Amount: $${data.amount.toFixed(2)}
Deposit Required: $${data.depositAmount.toFixed(2)}
Remaining Balance: $${(data.amount - data.depositAmount).toFixed(2)}

Pay deposit: ${process.env.NEXT_PUBLIC_APP_URL}/appointments/pay-deposit

Note: Your appointment will be confirmed once the deposit is received.
    `.trim(),
  };
}
