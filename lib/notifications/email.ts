import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  // Check if email notifications are enabled
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
    console.log('[Email] Skipped (disabled):', options.subject);
    return { success: true, messageId: 'skipped' };
  }

  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.error('[Email] SendGrid API key not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const msg = {
      to: options.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@beautybook.com',
        name: process.env.SENDGRID_FROM_NAME || 'BeautyBook',
      },
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const response = await sgMail.send(msg);

    console.log('[Email] Sent successfully:', options.subject);

    return {
      success: true,
      messageId: response[0]?.headers?.['x-message-id'] || 'sent',
    };
  } catch (error: any) {
    console.error('[Email] Failed to send:', error);

    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

export async function sendBulkEmails(emails: EmailOptions[]): Promise<{
  successCount: number;
  failureCount: number;
  errors: string[];
}> {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  );

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failureCount++;
      errors.push(`Email ${index + 1}: ${
        result.status === 'fulfilled'
          ? result.value.error
          : (result as PromiseRejectedResult).reason
      }`);
    }
  });

  return { successCount, failureCount, errors };
}
