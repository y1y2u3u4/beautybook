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

// Mock favorites data for demo mode
const mockFavorites = [
  {
    id: 'mock_fav_1',
    providerId: 'mock_provider_1',
    createdAt: new Date().toISOString(),
    provider: {
      id: 'mock_provider_1',
      businessName: 'Glow Beauty Studio',
      title: 'Premium Skincare & Facial Treatments',
      address: '123 Beauty Lane',
      city: 'Los Angeles',
      state: 'CA',
      averageRating: 4.9,
      reviewCount: 128,
      priceMin: 75,
      priceMax: 300,
      specialties: ['Facials', 'Skincare', 'Anti-Aging'],
      user: {
        imageUrl: null,
      },
    },
  },
  {
    id: 'mock_fav_2',
    providerId: 'mock_provider_2',
    createdAt: new Date().toISOString(),
    provider: {
      id: 'mock_provider_2',
      businessName: 'Luxe Hair Salon',
      title: 'Expert Hair Styling & Color',
      address: '456 Style Avenue',
      city: 'Los Angeles',
      state: 'CA',
      averageRating: 4.8,
      reviewCount: 95,
      priceMin: 50,
      priceMax: 250,
      specialties: ['Hair Styling', 'Color', 'Extensions'],
      user: {
        imageUrl: null,
      },
    },
  },
  {
    id: 'mock_fav_3',
    providerId: 'mock_provider_3',
    createdAt: new Date().toISOString(),
    provider: {
      id: 'mock_provider_3',
      businessName: 'Serenity Spa',
      title: 'Full Body Wellness & Massage',
      address: '789 Wellness Blvd',
      city: 'Los Angeles',
      state: 'CA',
      averageRating: 4.7,
      reviewCount: 72,
      priceMin: 80,
      priceMax: 200,
      specialties: ['Massage', 'Body Treatments', 'Aromatherapy'],
      user: {
        imageUrl: null,
      },
    },
  },
];

/**
 * GET /api/favorites
 * Get user's favorite providers
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
        favorites: mockFavorites,
        source: 'mock',
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({
        favorites: [],
        source: 'database',
      });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Get provider details for each favorite
    const providerIds = favorites.map(f => f.providerId);
    const providers = await prisma.providerProfile.findMany({
      where: { id: { in: providerIds } },
      select: {
        id: true,
        businessName: true,
        title: true,
        address: true,
        city: true,
        state: true,
        averageRating: true,
        reviewCount: true,
        priceMin: true,
        priceMax: true,
        specialties: true,
        user: {
          select: {
            imageUrl: true,
          },
        },
      },
    });

    // Map providers to favorites
    const providerMap = new Map(providers.map(p => [p.id, p]));
    const favoritesWithProviders = favorites.map(favorite => ({
      ...favorite,
      provider: providerMap.get(favorite.providerId) || null,
    }));

    return NextResponse.json({
      favorites: favoritesWithProviders,
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to get favorites:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get favorites' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites
 * Add a provider to favorites
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

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { providerId } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId is required' },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_providerId: {
          userId: user.id,
          providerId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Provider is already in your favorites' },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        providerId,
      },
    });

    return NextResponse.json({
      success: true,
      favorite,
    });
  } catch (error: any) {
    console.error('[API] Failed to add favorite:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/favorites
 * Remove a provider from favorites
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

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId is required' },
        { status: 400 }
      );
    }

    await prisma.favorite.delete({
      where: {
        userId_providerId: {
          userId: user.id,
          providerId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Provider removed from favorites',
    });
  } catch (error: any) {
    console.error('[API] Failed to remove favorite:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
