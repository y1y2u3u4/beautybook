import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/services
 * Get services for a provider
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const category = searchParams.get('category');
    const active = searchParams.get('active');

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId is required' },
        { status: 400 }
      );
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

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('[API] Failed to get services:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get services' },
      { status: 500 }
    );
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
