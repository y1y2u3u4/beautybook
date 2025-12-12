import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Check if database is available
async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * GET /api/provider/profile
 * Get current provider's profile
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

    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      // Return mock provider data
      return NextResponse.json({
        profile: {
          id: 'mock_provider',
          businessName: 'Demo Beauty Studio',
          title: 'Licensed Esthetician',
          bio: 'This is a demo profile. Database is unavailable.',
          phone: '(555) 123-4567',
          address: '123 Beauty Lane',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          experience: 5,
          specialties: ['Skincare', 'Facials'],
          languages: ['English'],
          priceMin: 50,
          priceMax: 200,
          averageRating: 4.8,
          reviewCount: 25,
          verified: true,
        },
        source: 'mock',
      });
    }

    // Get user with provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        providerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found. Please register as a provider first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: user.providerProfile,
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to get provider profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get provider profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/provider/profile
 * Update current provider's profile
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

    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return NextResponse.json({
        success: true,
        source: 'mock',
        message: 'Profile update simulated (demo mode)',
      });
    }

    const body = await request.json();

    // Get user with provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Allowed update fields
    const allowedFields = [
      'businessName',
      'title',
      'bio',
      'phone',
      'address',
      'city',
      'state',
      'zipCode',
      'experience',
      'specialties',
      'languages',
      'priceMin',
      'priceMax',
      'businessHours',
    ];

    // Filter to only allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Update provider profile
    const updatedProfile = await prisma.providerProfile.update({
      where: { id: user.providerProfile.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to update provider profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update provider profile' },
      { status: 500 }
    );
  }
}
