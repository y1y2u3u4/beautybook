import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
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

    return NextResponse.json({ favorites: favoritesWithProviders });
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
