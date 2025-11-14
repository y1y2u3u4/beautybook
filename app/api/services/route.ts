import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/services - Get all services for a provider
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user?.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    // Get all services for this provider
    const services = await prisma.service.findMany({
      where: { providerId: user.providerProfile.id },
      orderBy: [
        { active: 'desc' }, // Active services first
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

// POST /api/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get provider profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user?.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, duration, price, category } = body;

    // Validate required fields
    if (!name || !description || !duration || !price || !category) {
      return NextResponse.json(
        { error: 'Name, description, duration, price, and category are required' },
        { status: 400 }
      );
    }

    // Validate duration and price
    if (duration <= 0 || price <= 0) {
      return NextResponse.json(
        { error: 'Duration and price must be positive numbers' },
        { status: 400 }
      );
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        providerId: user.providerProfile.id,
        name: name.trim(),
        description: description.trim(),
        duration: parseInt(duration),
        price: parseFloat(price),
        category: category.trim(),
        active: true,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
