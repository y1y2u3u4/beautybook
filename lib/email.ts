import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface AppointmentEmailData {
  customerEmail: string;
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
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmation(data: AppointmentEmailData) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email');
    return { success: false, error: 'SendGrid not configured' };
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@beautybook.com';

  const msg = {
    to: data.customerEmail,
    from: fromEmail,
    subject: `预约确认 - ${data.providerName}`,
    html: generateConfirmationEmailHTML(data),
    text: generateConfirmationEmailText(data),
  };

  try {
    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${data.customerEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send appointment reminder email (24 hours before)
 */
export async function sendAppointmentReminder(data: AppointmentEmailData) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email');
    return { success: false, error: 'SendGrid not configured' };
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@beautybook.com';

  const msg = {
    to: data.customerEmail,
    from: fromEmail,
    subject: `预约提醒 - 明天 ${data.startTime}`,
    html: generateReminderEmailHTML(data),
    text: generateReminderEmailText(data),
  };

  try {
    await sgMail.send(msg);
    console.log(`Reminder email sent to ${data.customerEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending reminder email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send appointment cancellation email
 */
export async function sendAppointmentCancellation(
  data: AppointmentEmailData & { reason?: string }
) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email');
    return { success: false, error: 'SendGrid not configured' };
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@beautybook.com';

  const msg = {
    to: data.customerEmail,
    from: fromEmail,
    subject: `预约已取消 - ${data.providerName}`,
    html: generateCancellationEmailHTML(data),
    text: generateCancellationEmailText(data),
  };

  try {
    await sgMail.send(msg);
    console.log(`Cancellation email sent to ${data.customerEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending cancellation email:', error);
    return { success: false, error: error.message };
  }
}

// Email template generators

function generateConfirmationEmailHTML(data: AppointmentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: bold; color: #6b7280; }
    .detail-value { color: #111827; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ 预约确认</h1>
      <p>您的预约已成功确认！</p>
    </div>
    <div class="content">
      <p>尊敬的 ${data.customerName}，</p>
      <p>感谢您通过 BeautyBook 预约服务！以下是您的预约详情：</p>

      <div class="card">
        <h2 style="margin-top: 0; color: #667eea;">📅 预约信息</h2>
        <div class="detail-row">
          <span class="detail-label">服务提供者</span>
          <span class="detail-value">${data.providerName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">服务项目</span>
          <span class="detail-value">${data.serviceName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">预约日期</span>
          <span class="detail-value">${data.date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">预约时间</span>
          <span class="detail-value">${data.startTime} - ${data.endTime}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">支付金额</span>
          <span class="detail-value" style="font-size: 18px; font-weight: bold; color: #667eea;">$${data.amount.toFixed(2)}</span>
        </div>
      </div>

      <p><strong>💡 温馨提示：</strong></p>
      <ul>
        <li>我们会在预约前24小时发送提醒</li>
        <li>如需取消或调整时间，请访问您的预约管理页面</li>
        <li>请准时到达，迟到可能影响服务质量</li>
      </ul>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/appointments" class="button">查看我的预约</a>
      </div>

      <div class="footer">
        <p>预约 ID: ${data.appointmentId}</p>
        <p>此邮件由 BeautyBook 自动发送，请勿回复</p>
        <p>© 2024 BeautyBook. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateConfirmationEmailText(data: AppointmentEmailData): string {
  return `
预约确认

尊敬的 ${data.customerName}，

感谢您通过 BeautyBook 预约服务！以下是您的预约详情：

预约信息：
- 服务提供者：${data.providerName}
- 服务项目：${data.serviceName}
- 预约日期：${data.date}
- 预约时间：${data.startTime} - ${data.endTime}
- 支付金额：$${data.amount.toFixed(2)}

温馨提示：
- 我们会在预约前24小时发送提醒
- 如需取消或调整时间，请访问您的预约管理页面
- 请准时到达，迟到可能影响服务质量

查看预约：${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/appointments

预约 ID: ${data.appointmentId}

此邮件由 BeautyBook 自动发送，请勿回复。
© 2024 BeautyBook. All rights reserved.
  `;
}

function generateReminderEmailHTML(data: AppointmentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ 预约提醒</h1>
      <p>您的预约将在明天进行</p>
    </div>
    <div class="content">
      <p>尊敬的 ${data.customerName}，</p>

      <div class="highlight">
        <strong>⚠️ 别忘了！您的预约将在明天 ${data.startTime} 开始</strong>
      </div>

      <div class="card">
        <h2 style="margin-top: 0; color: #f59e0b;">📅 预约详情</h2>
        <p><strong>服务提供者：</strong>${data.providerName}</p>
        <p><strong>服务项目：</strong>${data.serviceName}</p>
        <p><strong>时间：</strong>${data.date} ${data.startTime} - ${data.endTime}</p>
      </div>

      <p><strong>准备事项：</strong></p>
      <ul>
        <li>请提前 5-10 分钟到达</li>
        <li>如需取消，请尽快操作以避免费用损失</li>
        <li>如有特殊要求，请提前联系服务提供者</li>
      </ul>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/appointments" class="button">管理我的预约</a>
      </div>

      <div class="footer">
        <p>预约 ID: ${data.appointmentId}</p>
        <p>期待为您服务！</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateReminderEmailText(data: AppointmentEmailData): string {
  return `
预约提醒

尊敬的 ${data.customerName}，

别忘了！您的预约将在明天 ${data.startTime} 开始

预约详情：
- 服务提供者：${data.providerName}
- 服务项目：${data.serviceName}
- 时间：${data.date} ${data.startTime} - ${data.endTime}

准备事项：
- 请提前 5-10 分钟到达
- 如需取消，请尽快操作以避免费用损失
- 如有特殊要求，请提前联系服务提供者

管理预约：${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/appointments

预约 ID: ${data.appointmentId}

期待为您服务！
  `;
}

function generateCancellationEmailHTML(data: AppointmentEmailData & { reason?: string }): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6b7280 0%, #374151 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ 预约已取消</h1>
      <p>您的预约已成功取消</p>
    </div>
    <div class="content">
      <p>尊敬的 ${data.customerName}，</p>
      <p>您的以下预约已被取消：</p>

      <div class="card">
        <h2 style="margin-top: 0; color: #6b7280;">📅 取消的预约</h2>
        <p><strong>服务提供者：</strong>${data.providerName}</p>
        <p><strong>服务项目：</strong>${data.serviceName}</p>
        <p><strong>原定时间：</strong>${data.date} ${data.startTime} - ${data.endTime}</p>
        ${data.reason ? `<p><strong>取消原因：</strong>${data.reason}</p>` : ''}
      </div>

      <p>如果您已支付，退款将在 5-7 个工作日内退回到您的原支付方式。</p>

      <p>我们期待下次为您服务！</p>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/providers" class="button">重新预约</a>
      </div>

      <div class="footer">
        <p>如有疑问，请联系客服</p>
        <p>© 2024 BeautyBook. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateCancellationEmailText(data: AppointmentEmailData & { reason?: string }): string {
  return `
预约已取消

尊敬的 ${data.customerName}，

您的以下预约已被取消：

取消的预约：
- 服务提供者：${data.providerName}
- 服务项目：${data.serviceName}
- 原定时间：${data.date} ${data.startTime} - ${data.endTime}
${data.reason ? `- 取消原因：${data.reason}` : ''}

如果您已支付，退款将在 5-7 个工作日内退回到您的原支付方式。

我们期待下次为您服务！

重新预约：${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/providers

如有疑问，请联系客服。
© 2024 BeautyBook. All rights reserved.
  `;
}

interface AppointmentRescheduleEmailData {
  customerEmail: string;
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
 * Send appointment reschedule email
 */
export async function sendAppointmentReschedule(data: AppointmentRescheduleEmailData) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email');
    return { success: false, error: 'SendGrid not configured' };
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@beautybook.com';

  const msg = {
    to: data.customerEmail,
    from: fromEmail,
    subject: `预约已改期 - ${data.providerName}`,
    html: generateRescheduleEmailHTML(data),
    text: generateRescheduleEmailText(data),
  };

  try {
    await sgMail.send(msg);
    console.log(`Reschedule email sent to ${data.customerEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending reschedule email:', error);
    return { success: false, error: error.message };
  }
}

function generateRescheduleEmailHTML(data: AppointmentRescheduleEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .old-time { text-decoration: line-through; color: #9ca3af; }
    .new-time { color: #3b82f6; font-weight: bold; }
    .arrow { font-size: 24px; color: #3b82f6; text-align: center; margin: 10px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔄 预约已改期</h1>
      <p>您的预约时间已更新</p>
    </div>
    <div class="content">
      <p>尊敬的 ${data.customerName}，</p>
      <p>您的预约已成功改期。以下是更新后的预约详情：</p>

      <div class="card">
        <h2 style="margin-top: 0; color: #3b82f6;">📅 预约信息</h2>
        <p><strong>服务提供者：</strong>${data.providerName}</p>
        <p><strong>服务项目：</strong>${data.serviceName}</p>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;" class="old-time">
            <strong>原预约时间：</strong><br/>
            ${data.oldDate} ${data.oldStartTime} - ${data.oldEndTime}
          </p>
          <div class="arrow">↓</div>
          <p style="margin: 5px 0;" class="new-time">
            <strong>新预约时间：</strong><br/>
            ${data.newDate} ${data.newStartTime} - ${data.newEndTime}
          </p>
        </div>

        <p><strong>支付金额：</strong><span style="font-size: 18px; color: #3b82f6;">$${data.amount.toFixed(2)}</span></p>
      </div>

      <p><strong>💡 温馨提示：</strong></p>
      <ul>
        <li>我们会在新预约时间前24小时发送提醒</li>
        <li>如需再次调整，请访问预约管理页面</li>
        <li>请准时到达</li>
      </ul>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/appointments" class="button">查看我的预约</a>
      </div>

      <div class="footer">
        <p>预约 ID: ${data.appointmentId}</p>
        <p>此邮件由 BeautyBook 自动发送，请勿回复</p>
        <p>© 2024 BeautyBook. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateRescheduleEmailText(data: AppointmentRescheduleEmailData): string {
  return `
预约已改期

尊敬的 ${data.customerName}，

您的预约已成功改期。以下是更新后的预约详情：

预约信息：
- 服务提供者：${data.providerName}
- 服务项目：${data.serviceName}

原预约时间：
${data.oldDate} ${data.oldStartTime} - ${data.oldEndTime}

新预约时间：
${data.newDate} ${data.newStartTime} - ${data.newEndTime}

支付金额：$${data.amount.toFixed(2)}

温馨提示：
- 我们会在新预约时间前24小时发送提醒
- 如需再次调整，请访问预约管理页面
- 请准时到达

查看预约：${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/appointments

预约 ID: ${data.appointmentId}

此邮件由 BeautyBook 自动发送，请勿回复。
© 2024 BeautyBook. All rights reserved.
  `;
}

interface WaitlistEmailData {
  customerEmail: string;
  customerName: string;
  providerName: string;
  serviceName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  flexible: boolean;
}

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmation(data: WaitlistEmailData) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email');
    return { success: false, error: 'SendGrid not configured' };
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@beautybook.com';

  const timeWindow = data.startTime && data.endTime
    ? `${data.startTime} - ${data.endTime}`
    : data.flexible
    ? '全天任意时间'
    : '特定时间';

  const msg = {
    to: data.customerEmail,
    from: fromEmail,
    subject: `已加入候补名单 - ${data.providerName}`,
    text: `已加入候补名单\n\n您已成功加入${data.providerName}的候补名单。\n服务：${data.serviceName}\n日期：${data.date}\n时间：${timeWindow}\n\n当时间段可用时我们会通知您。`,
  };

  try {
    await sgMail.send(msg);
    console.log(`Waitlist confirmation email sent to ${data.customerEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending waitlist email:', error);
    return { success: false, error: error.message };
  }
}

interface WaitlistAvailableEmailData {
  customerEmail: string;
  customerName: string;
  providerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
}

/**
 * Send waitlist slot available notification
 */
export async function sendWaitlistSlotAvailable(data: WaitlistAvailableEmailData) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email');
    return { success: false, error: 'SendGrid not configured' };
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@beautybook.com';

  const msg = {
    to: data.customerEmail,
    from: fromEmail,
    subject: `⚡ 时间段可用！ - ${data.providerName}`,
    text: `好消息！您等待的时间段现在可以预约了！\n\n服务：${data.serviceName}\n日期：${data.date}\n时间：${data.startTime} - ${data.endTime}\n价格：$${data.amount.toFixed(2)}\n\n请尽快完成预约，先到先得！`,
  };

  try {
    await sgMail.send(msg);
    console.log(`Waitlist slot available email sent to ${data.customerEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending waitlist available email:', error);
    return { success: false, error: error.message };
  }
}
