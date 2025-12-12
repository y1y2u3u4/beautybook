import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
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

interface ProviderRegistrationData {
  // Basic Info
  businessName: string;
  title: string;
  bio: string;
  phone: string;

  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;

  // Professional Info
  experience: number;
  specialties: string[];
  languages: string[];

  // Pricing
  priceMin: number;
  priceMax: number;

  // Business Hours (optional)
  businessHours?: {
    [day: string]: { open: string; close: string; closed: boolean };
  };
}

/**
 * POST /api/providers/register
 * Register a new provider profile
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Could not get user from Clerk' },
        { status: 500 }
      );
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: 'User has no email address' },
        { status: 400 }
      );
    }

    // Check database availability
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      // Return mock success for demo
      return NextResponse.json({
        success: true,
        source: 'mock',
        message: 'Provider registration simulated (demo mode)',
        provider: {
          id: `mock_provider_${Date.now()}`,
          businessName: 'Demo Business',
          verified: false,
        },
      });
    }

    // Parse registration data
    const body: ProviderRegistrationData = await request.json();

    // Validate required fields
    const requiredFields = ['businessName', 'title', 'bio', 'phone', 'address', 'city', 'state', 'zipCode', 'priceMin', 'priceMax'];
    for (const field of requiredFields) {
      if (!body[field as keyof ProviderRegistrationData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if user already has a provider profile
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    if (existingUser?.providerProfile) {
      return NextResponse.json(
        { error: 'User already has a provider profile' },
        { status: 400 }
      );
    }

    // Create or update user, then create provider profile
    const user = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role: 'PROVIDER',
      },
      create: {
        clerkId: clerkUserId,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role: 'PROVIDER',
      },
    });

    // Create provider profile
    const providerProfile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        businessName: body.businessName,
        title: body.title,
        bio: body.bio,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        experience: body.experience || 0,
        specialties: body.specialties || [],
        languages: body.languages || ['English'],
        priceMin: body.priceMin,
        priceMax: body.priceMax,
        businessHours: body.businessHours || {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true },
        },
        verified: false,
        averageRating: 0,
        reviewCount: 0,
      },
    });

    // Create default availability slots
    const defaultAvailability = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, // Monday
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' }, // Thursday
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' }, // Friday
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' }, // Saturday
    ];

    await prisma.availability.createMany({
      data: defaultAvailability.map(slot => ({
        providerId: providerProfile.id,
        ...slot,
        active: true,
      })),
    });

    return NextResponse.json({
      success: true,
      source: 'database',
      message: 'Provider registered successfully',
      provider: {
        id: providerProfile.id,
        businessName: providerProfile.businessName,
        verified: providerProfile.verified,
      },
      redirectUrl: '/provider/dashboard',
    });
  } catch (error: any) {
    console.error('[API] Failed to register provider:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register provider' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/providers/register
 * Check if current user can register as provider
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
      return NextResponse.json({
        canRegister: true,
        hasProviderProfile: false,
        source: 'mock',
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    return NextResponse.json({
      canRegister: !user?.providerProfile,
      hasProviderProfile: !!user?.providerProfile,
      provider: user?.providerProfile ? {
        id: user.providerProfile.id,
        businessName: user.providerProfile.businessName,
      } : null,
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to check registration status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check registration status' },
      { status: 500 }
    );
  }
}
