import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingSlug, qrCodeEnabled, publicBookingEnabled } = body;

    // Find user's provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Update booking slug if provided
    if (bookingSlug !== undefined) {
      const normalizedSlug = slugify(bookingSlug, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });

      // Check if slug is already taken by another provider
      const existingProvider = await prisma.providerProfile.findUnique({
        where: { bookingSlug: normalizedSlug },
      });

      if (existingProvider && existingProvider.id !== user.providerProfile.id) {
        return NextResponse.json(
          { error: 'This booking slug is already taken. Please choose another.' },
          { status: 400 }
        );
      }

      updateData.bookingSlug = normalizedSlug;
    }

    // Update QR code settings if provided
    if (qrCodeEnabled !== undefined) {
      updateData.qrCodeEnabled = qrCodeEnabled;
    }

    // Update public booking settings if provided
    if (publicBookingEnabled !== undefined) {
      updateData.publicBookingEnabled = publicBookingEnabled;
    }

    // Update provider profile
    const updatedProvider = await prisma.providerProfile.update({
      where: { id: user.providerProfile.id },
      data: updateData,
    });

    return NextResponse.json(updatedProvider);
  } catch (error) {
    console.error('Error updating booking settings:', error);
    return NextResponse.json(
      { error: 'Failed to update booking settings' },
      { status: 500 }
    );
  }
}
