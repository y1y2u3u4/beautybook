import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isGoogleCalendarConfigured } from '@/lib/google-calendar';

/**
 * GET /api/calendar/status
 * Get calendar sync status and settings
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

    const configured = isGoogleCalendarConfigured();

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
      return NextResponse.json({
        configured,
        connected: false,
        settings: null,
      });
    }

    const calendarSync = user.providerProfile.calendarSync;

    return NextResponse.json({
      configured,
      connected: calendarSync?.enabled || false,
      settings: calendarSync ? {
        provider: calendarSync.provider,
        autoSync: calendarSync.autoSync,
        syncDirection: calendarSync.syncDirection,
        lastSyncedAt: calendarSync.lastSyncedAt,
        enabled: calendarSync.enabled,
      } : null,
    });
  } catch (error: any) {
    console.error('[API] Failed to get calendar status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get calendar status' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/calendar/status
 * Update calendar sync settings
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { autoSync, syncDirection, enabled } = body;

    // Get user's calendar sync
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

    if (!user?.providerProfile?.calendarSync) {
      return NextResponse.json(
        { error: 'Calendar sync not found' },
        { status: 404 }
      );
    }

    // Update settings
    const updated = await prisma.calendarSync.update({
      where: { id: user.providerProfile.calendarSync.id },
      data: {
        autoSync: autoSync !== undefined ? autoSync : undefined,
        syncDirection: syncDirection || undefined,
        enabled: enabled !== undefined ? enabled : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        provider: updated.provider,
        autoSync: updated.autoSync,
        syncDirection: updated.syncDirection,
        lastSyncedAt: updated.lastSyncedAt,
        enabled: updated.enabled,
      },
    });
  } catch (error: any) {
    console.error('[API] Failed to update calendar settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update calendar settings' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/status
 * Disconnect calendar sync
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's calendar sync
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

    if (!user?.providerProfile?.calendarSync) {
      return NextResponse.json(
        { error: 'Calendar sync not found' },
        { status: 404 }
      );
    }

    // Delete calendar sync record
    await prisma.calendarSync.delete({
      where: { id: user.providerProfile.calendarSync.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Calendar disconnected successfully',
    });
  } catch (error: any) {
    console.error('[API] Failed to disconnect calendar:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect calendar' },
      { status: 500 }
    );
  }
}
