import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { mockServices } from '@/lib/mock-db';

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
 * GET /api/services
 * Get services for a provider or current user's provider
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let providerId = searchParams.get('providerId');
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const myServices = searchParams.get('my') === 'true';

    const dbAvailable = await isDatabaseAvailable();

    // If requesting own services, get provider ID from auth
    if (myServices) {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (dbAvailable) {
        const user = await prisma.user.findUnique({
          where: { clerkId: clerkUserId },
          include: { providerProfile: true },
        });

        if (user?.providerProfile) {
          providerId = user.providerProfile.id;
        } else {
          // User is not a provider, return mock data
          return NextResponse.json({ services: mockServices, source: 'mock' });
        }
      } else {
        // Database unavailable, return mock
        return NextResponse.json({ services: mockServices, source: 'mock' });
      }
    }

    if (!providerId) {
      // Return all mock services if no provider ID
      return NextResponse.json({ services: mockServices, source: 'mock' });
    }

    if (!dbAvailable) {
      // Filter mock services by provider if needed
      const filtered = mockServices.filter(s => s.providerId === providerId);
      return NextResponse.json({ services: filtered.length ? filtered : mockServices, source: 'mock' });
    }

    const whereClause: any = { providerId };

    if (category) {
      whereClause.category = category;
    }

    if (active !== null) {
      whereClause.active = active === 'true';
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ services, source: 'database' });
  } catch (error: any) {
    console.error('[API] Failed to get services:', error);
    // Return mock data on error
    return NextResponse.json({ services: mockServices, source: 'mock' });
  }
}

/**
 * POST /api/services
 * Create a new service (provider only)
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

    // Get user and verify they are a provider
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json(
        { error: 'Only providers can create services' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, duration, price, category } = body;

    // Validate required fields
    if (!name || !description || !duration || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        providerId: user.providerProfile.id,
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        category,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error: any) {
    console.error('[API] Failed to create service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
}
