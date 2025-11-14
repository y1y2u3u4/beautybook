import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/locations - Get all locations for a provider or specific provider's locations
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    // If providerId provided, get public locations (for customers)
    if (providerId) {
      const locations = await prisma.location.findMany({
        where: {
          providerId,
          active: true,
        },
        orderBy: [
          { isPrimary: 'desc' },
          { name: 'asc' },
        ],
      });

      return NextResponse.json({ locations });
    }

    // Otherwise, get provider's own locations (requires auth)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    const locations = await prisma.location.findMany({
      where: {
        providerId: user.providerProfile.id,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ locations });
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST /api/locations - Create a new location
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, address, city, state, zipCode, phone, email, businessHours, isPrimary } = body;

    // Validate required fields
    if (!name || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'Name, address, city, state, and zipCode are required' },
        { status: 400 }
      );
    }

    // If this is set as primary, unset other primaries
    if (isPrimary) {
      await prisma.location.updateMany({
        where: {
          providerId: user.providerProfile.id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Check if provider has any locations, if not, make this primary
    const existingLocations = await prisma.location.count({
      where: {
        providerId: user.providerProfile.id,
      },
    });

    const location = await prisma.location.create({
      data: {
        providerId: user.providerProfile.id,
        name,
        address,
        city,
        state,
        zipCode,
        phone: phone || null,
        email: email || null,
        businessHours: businessHours || null,
        isPrimary: isPrimary || existingLocations === 0,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      location,
    });
  } catch (error: any) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
