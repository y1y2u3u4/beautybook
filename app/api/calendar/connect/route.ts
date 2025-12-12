import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGoogleAuthUrl, isGoogleCalendarConfigured } from '@/lib/google-calendar';

/**
 * GET /api/calendar/connect
 * Initiate Google Calendar OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if Google Calendar is configured
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json(
        {
          error: 'Google Calendar integration is not configured',
          message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables',
          configured: false,
        },
        { status: 503 }
      );
    }

    // Generate state parameter with user ID for security
    const state = Buffer.from(JSON.stringify({
      userId: clerkUserId,
      timestamp: Date.now(),
    })).toString('base64');

    const authUrl = getGoogleAuthUrl(state);

    return NextResponse.json({
      authUrl,
      configured: true,
    });
  } catch (error: any) {
    console.error('[API] Failed to generate Google auth URL:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect to Google Calendar' },
      { status: 500 }
    );
  }
}
