import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  fetchGoogleCalendarEvents,
  convertGoogleEventToAppointment,
  refreshAccessToken,
  isGoogleCalendarConfigured,
} from '@/lib/google-calendar';

// Mock events for demo mode
const mockGoogleEvents = [
  {
    googleEventId: 'google_evt_001',
    title: 'Team Meeting',
    serviceName: 'Team Meeting',
    customerName: '',
    customerEmail: '',
    description: 'Weekly team sync',
    location: 'Office',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration: 60,
    source: 'google' as const,
    synced: true,
    status: 'confirmed',
  },
  {
    googleEventId: 'google_evt_002',
    title: 'Facial Treatment - Maria Garcia',
    serviceName: 'Facial Treatment',
    customerName: 'Maria Garcia',
    customerEmail: 'maria@example.com',
    description: 'Regular facial appointment',
    location: '',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration: 90,
    source: 'google' as const,
    synced: true,
    status: 'confirmed',
  },
  {
    googleEventId: 'google_evt_003',
    title: 'Hair Coloring - Jennifer Lee',
    serviceName: 'Hair Coloring',
    customerName: 'Jennifer Lee',
    customerEmail: 'jennifer@example.com',
    description: 'Full color treatment',
    location: '',
    startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration: 120,
    source: 'google' as const,
    synced: false,
    status: 'confirmed',
  },
];

/**
 * GET /api/calendar/events
 * Fetch events from Google Calendar
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
      // Return mock data for demo
      return NextResponse.json({
        events: mockGoogleEvents,
        source: 'mock',
        connected: false,
        message: 'Google Calendar not configured - showing demo data',
      });
    }

    // Get user's calendar sync settings
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        providerProfile: {
          include: {
            calendarSync: true,
          },
        },
      },
    });

    if (!user?.providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    const calendarSync = user.providerProfile.calendarSync;

    if (!calendarSync || !calendarSync.enabled) {
      // Return mock data if not connected
      return NextResponse.json({
        events: mockGoogleEvents,
        source: 'mock',
        connected: false,
        message: 'Google Calendar not connected - showing demo data',
      });
    }

    // Check if token needs refresh
    let accessToken = calendarSync.accessToken;
    if (calendarSync.expiresAt && new Date(calendarSync.expiresAt) < new Date()) {
      try {
        const newCredentials = await refreshAccessToken(calendarSync.refreshToken);
        accessToken = newCredentials.access_token || accessToken;

        // Update stored tokens
        await prisma.calendarSync.update({
          where: { id: calendarSync.id },
          data: {
            accessToken: newCredentials.access_token || undefined,
            expiresAt: newCredentials.expiry_date ? new Date(newCredentials.expiry_date) : undefined,
          },
        });
      } catch (refreshError) {
        console.error('[API] Failed to refresh token:', refreshError);
        return NextResponse.json({
          events: [],
          source: 'error',
          connected: false,
          error: 'Token expired - please reconnect Google Calendar',
        });
      }
    }

    // Fetch events from Google Calendar
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin')
      ? new Date(searchParams.get('timeMin')!)
      : new Date();
    const timeMax = searchParams.get('timeMax')
      ? new Date(searchParams.get('timeMax')!)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const googleEvents = await fetchGoogleCalendarEvents(
      accessToken,
      calendarSync.refreshToken,
      { timeMin, timeMax }
    );

    // Convert to our format
    const events = googleEvents
      .map(convertGoogleEventToAppointment)
      .filter(Boolean);

    // Update last synced time
    await prisma.calendarSync.update({
      where: { id: calendarSync.id },
      data: { lastSyncedAt: new Date() },
    });

    return NextResponse.json({
      events,
      source: 'google',
      connected: true,
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Failed to fetch calendar events:', error);

    // Return mock data on error
    return NextResponse.json({
      events: mockGoogleEvents,
      source: 'mock',
      connected: false,
      error: error.message || 'Failed to fetch calendar events',
    });
  }
}
