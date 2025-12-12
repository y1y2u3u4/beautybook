import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getTokensFromCode } from '@/lib/google-calendar';

/**
 * GET /api/calendar/callback
 * Handle Google OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('[API] Google OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/provider/calendar-sync?error=${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/provider/calendar-sync?error=missing_params`
      );
    }

    // Decode and validate state
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/provider/calendar-sync?error=invalid_state`
      );
    }

    // Verify state is not too old (15 minutes)
    if (Date.now() - stateData.timestamp > 15 * 60 * 1000) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/provider/calendar-sync?error=expired_state`
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/provider/calendar-sync?error=no_token`
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: stateData.userId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/provider/calendar-sync?error=provider_not_found`
      );
    }

    // Store tokens in database (create or update calendar sync record)
    await prisma.calendarSync.upsert({
      where: { providerId: user.providerProfile.id },
      create: {
        providerId: user.providerProfile.id,
        provider: 'GOOGLE',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        enabled: true,
        autoSync: true,
        syncDirection: 'BOTH',
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        enabled: true,
        lastSyncedAt: new Date(),
      },
    });

    // Redirect to calendar sync page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/provider/calendar-sync?success=connected`
    );
  } catch (error: any) {
    console.error('[API] Failed to complete Google OAuth:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/provider/calendar-sync?error=oauth_failed`
    );
  }
}
