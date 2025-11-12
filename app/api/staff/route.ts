import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/staff - Get all staff for a provider
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

    // Get all staff for this provider
    const staff = await prisma.staff.findMany({
      where: { providerId: user.providerProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ staff });
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// POST /api/staff - Create new staff member
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
    const { name, email, phone, title, bio, specialties, avatar } = body;

    // Validate required fields
    if (!name || !email || !title) {
      return NextResponse.json(
        { error: 'Name, email, and title are required' },
        { status: 400 }
      );
    }

    // Create staff member
    const staff = await prisma.staff.create({
      data: {
        providerId: user.providerProfile.id,
        name,
        email,
        phone: phone || null,
        title,
        bio: bio || null,
        specialties: specialties || [],
        avatar: avatar || null,
        active: true,
      },
    });

    return NextResponse.json({ staff }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}
