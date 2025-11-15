import twilio from 'twilio';

// Initialize Twilio client
let twilioClient: ReturnType<typeof twilio> | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export interface SMSOptions {
  to: string;
  message: string;
}

export async function sendSMS(options: SMSOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  // Check if SMS notifications are enabled
  if (process.env.ENABLE_SMS_NOTIFICATIONS !== 'true') {
    console.log('[SMS] Skipped (disabled):', options.message.substring(0, 50));
    return { success: true, messageId: 'skipped' };
  }

  // Check if Twilio is configured
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('[SMS] Twilio not configured');
    return { success: false, error: 'SMS service not configured' };
  }

  // Validate phone number format
  const phoneNumber = options.to.replace(/[^0-9+]/g, '');
  if (!phoneNumber.startsWith('+')) {
    return { success: false, error: 'Phone number must include country code (e.g., +1)' };
  }

  try {
    const message = await twilioClient.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log('[SMS] Sent successfully:', message.sid);

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error('[SMS] Failed to send:', error);

    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

export async function sendBulkSMS(messages: SMSOptions[]): Promise<{
  successCount: number;
  failureCount: number;
  errors: string[];
}> {
  const results = await Promise.allSettled(
    messages.map(msg => sendSMS(msg))
  );

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failureCount++;
      errors.push(`SMS ${index + 1}: ${
        result.status === 'fulfilled'
          ? result.value.error
          : (result as PromiseRejectedResult).reason
      }`);
    }
  });

  return { successCount, failureCount, errors };
}
