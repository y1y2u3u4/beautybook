import twilio from 'twilio';

// Initialize Twilio client lazily
let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    // Only initialize if credentials are properly configured
    if (
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
      process.env.TWILIO_AUTH_TOKEN.length > 10
    ) {
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }
  return twilioClient;
}

interface AppointmentSMSData {
  customerPhone: string;
  customerName: string;
  providerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  appointmentId: string;
}

/**
 * Send appointment confirmation SMS
 */
export async function sendAppointmentConfirmationSMS(data: AppointmentSMSData) {
  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    console.warn('Twilio not configured, skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio phone number not configured, skipping SMS');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  // Format phone number (ensure it starts with +)
  const toPhone = data.customerPhone.startsWith('+')
    ? data.customerPhone
    : `+1${data.customerPhone.replace(/\D/g, '')}`;

  const message = `✨ BeautyBook预约确认

您好 ${data.customerName}！

您的预约已确认：
📍 ${data.providerName}
💇 ${data.serviceName}
📅 ${data.date}
⏰ ${data.startTime} - ${data.endTime}
💰 $${data.amount.toFixed(2)}

我们会在预约前24小时再次提醒您。

查看详情: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/appointments

预约ID: ${data.appointmentId}`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log(`Confirmation SMS sent to ${toPhone}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending confirmation SMS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send appointment reminder SMS (24 hours before)
 */
export async function sendAppointmentReminderSMS(data: AppointmentSMSData) {
  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    console.warn('Twilio not configured, skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio phone number not configured, skipping SMS');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  const toPhone = data.customerPhone.startsWith('+')
    ? data.customerPhone
    : `+1${data.customerPhone.replace(/\D/g, '')}`;

  const message = `⏰ BeautyBook预约提醒

您好 ${data.customerName}！

您的预约将在明天进行：
📍 ${data.providerName}
💇 ${data.serviceName}
📅 明天 ${data.startTime}

请准时到达，提前5-10分钟为佳。

如需取消或调整，请尽快访问:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/appointments

期待为您服务！`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log(`Reminder SMS sent to ${toPhone}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending reminder SMS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send appointment cancellation SMS
 */
export async function sendAppointmentCancellationSMS(
  data: AppointmentSMSData & { reason?: string; refundAmount?: number }
) {
  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    console.warn('Twilio not configured, skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio phone number not configured, skipping SMS');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  const toPhone = data.customerPhone.startsWith('+')
    ? data.customerPhone
    : `+1${data.customerPhone.replace(/\D/g, '')}`;

  const refundInfo = data.refundAmount
    ? `\n💰 退款金额: $${data.refundAmount.toFixed(2)}\n退款将在5-7个工作日内处理。`
    : '';

  const message = `❌ BeautyBook预约取消

您好 ${data.customerName}，

您的预约已取消：
📍 ${data.providerName}
💇 ${data.serviceName}
📅 ${data.date} ${data.startTime}${refundInfo}

我们期待下次为您服务！

重新预约: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/providers`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log(`Cancellation SMS sent to ${toPhone}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending cancellation SMS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send appointment assignment notification SMS to staff
 */
export async function sendStaffAssignmentSMS(data: {
  staffPhone: string;
  staffName: string;
  customerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    console.warn('Twilio not configured, skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio phone number not configured, skipping SMS');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  const toPhone = data.staffPhone.startsWith('+')
    ? data.staffPhone
    : `+1${data.staffPhone.replace(/\D/g, '')}`;

  const message = `👤 新预约分配

您好 ${data.staffName}！

您有新的预约任务：
👤 客户: ${data.customerName}
💇 服务: ${data.serviceName}
📅 ${data.date}
⏰ ${data.startTime} - ${data.endTime}

请准时到岗，为客户提供优质服务。

查看详情: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/manage-appointments`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log(`Assignment SMS sent to staff ${toPhone}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending assignment SMS:', error);
    return { success: false, error: error.message };
  }
}

interface AppointmentRescheduleSMSData {
  customerPhone: string;
  customerName: string;
  providerName: string;
  serviceName: string;
  oldDate: string;
  oldStartTime: string;
  oldEndTime: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  amount: number;
  appointmentId: string;
}

/**
 * Send appointment reschedule SMS notification
 */
export async function sendAppointmentRescheduleSMS(data: AppointmentRescheduleSMSData) {
  const twilioClient = getTwilioClient();

  if (!twilioClient) {
    console.warn('Twilio not configured, skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio phone number not configured, skipping SMS');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  const toPhone = data.customerPhone.startsWith('+')
    ? data.customerPhone
    : `+1${data.customerPhone.replace(/\D/g, '')}`;

  const message = `🔄 预约已改期

您好 ${data.customerName}！

您在 ${data.providerName} 的预约已改期。

新时间:
📅 ${data.newDate}
⏰ ${data.newStartTime} - ${data.newEndTime}

原时间:
${data.oldDate} ${data.oldStartTime} - ${data.oldEndTime}

💇 服务: ${data.serviceName}
💰 金额: $${data.amount.toFixed(2)}

请准时到达。如需再次调整，请访问您的预约管理页面。

查看详情: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/appointments`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log(`Reschedule SMS sent to ${toPhone}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending reschedule SMS:', error);
    return { success: false, error: error.message };
  }
}

interface WaitlistSMSData {
  customerPhone: string;
  customerName: string;
  providerName: string;
  serviceName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  flexible: boolean;
}

export async function sendWaitlistConfirmationSMS(data: WaitlistSMSData) {
  const twilioClient = getTwilioClient();

  if (!twilioClient) {
    console.warn('Twilio not configured, skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio phone number not configured, skipping SMS');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  const toPhone = data.customerPhone.startsWith('+')
    ? data.customerPhone
    : `+1${data.customerPhone.replace(/\D/g, '')}`;

  const timeWindow = data.startTime && data.endTime
    ? `${data.startTime} - ${data.endTime}`
    : data.flexible
    ? '全天任意时间'
    : '特定时间';

  const message = `📋 已加入候补名单

您好 ${data.customerName}！

您已成功加入 ${data.providerName} 的候补名单。

💇 服务: ${data.serviceName}
📅 日期: ${data.date}
⏰ 时间: ${timeWindow}

当时间段可用时，我们会立即通知您。请保持电话畅通！

管理候补: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/appointments`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log(`Waitlist confirmation SMS sent to ${toPhone}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending waitlist SMS:', error);
    return { success: false, error: error.message };
  }
}

interface WaitlistAvailableSMSData {
  customerPhone: string;
  customerName: string;
  providerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
}

export async function sendWaitlistSlotAvailableSMS(data: WaitlistAvailableSMSData) {
  const twilioClient = getTwilioClient();

  if (!twilioClient) {
    console.warn('Twilio not configured, skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio phone number not configured, skipping SMS');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  const toPhone = data.customerPhone.startsWith('+')
    ? data.customerPhone
    : `+1${data.customerPhone.replace(/\D/g, '')}`;

  const message = `⚡ 时间段可用！

${data.customerName}，好消息！

您等待的时间段现在可以预约了！

💇 ${data.serviceName}
📍 ${data.providerName}
📅 ${data.date}
⏰ ${data.startTime} - ${data.endTime}
💰 $${data.amount.toFixed(2)}

⚠️ 先到先得，请尽快预约！

立即预约: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log(`Waitlist slot available SMS sent to ${toPhone}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending waitlist available SMS:', error);
    return { success: false, error: error.message };
  }
}
