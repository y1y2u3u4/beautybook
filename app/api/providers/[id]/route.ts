import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMockProviderWithDetails, mockReviews } from '@/lib/mock-db';

// Check if database is available
async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try database first, fallback to mock data
    const dbAvailable = await isDatabaseAvailable();
    let useDatabase = dbAvailable;

    if (useDatabase) {
      try {
      // Fetch provider with related data from database
      const provider = await prisma.providerProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              email: true,
            },
          },
          education: true,
          certifications: true,
          services: {
            where: { active: true },
            orderBy: { name: 'asc' },
          },
          availability: {
            where: { active: true },
          },
        },
      });

      if (!provider) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
        );
      }

      // Reviews temporarily disabled - database schema mismatch
      const reviews: any[] = [];
      const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      return NextResponse.json({
        provider,
        reviews,
        ratingDistribution: distribution,
        source: 'database',
      });
      } catch (dbError) {
        console.log('[API] Database query failed, falling back to mock data:', dbError);
        useDatabase = false;
      }
    }

    // Fallback to mock data
    console.log('[API] Using mock data - database unavailable');

    const mockProvider = getMockProviderWithDetails(id);

    if (!mockProvider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Get reviews for this provider
    const reviews = mockReviews.filter(r => r.providerId === id);

    // Calculate rating distribution from mock reviews
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    return NextResponse.json({
      provider: mockProvider,
      reviews,
      ratingDistribution: distribution,
      source: 'mock',
    });
  } catch (error: any) {
    console.error('[API] Failed to fetch provider:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
