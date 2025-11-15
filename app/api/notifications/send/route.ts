import { NextRequest, NextResponse } from 'next/server';
import { sendPendingNotifications } from '@/lib/notifications/scheduler';

/**
 * POST /api/notifications/send
 * Manually trigger sending of pending notifications
 * This can be called by a cron job or manually
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await sendPendingNotifications();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[API] Failed to send notifications:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/send
 * Check status of notification system
 */
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    emailEnabled: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    smsEnabled: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
  });
}
