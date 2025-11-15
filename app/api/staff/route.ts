import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/staff
 * Get staff members for a provider
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('providerId');
    const active = searchParams.get('active');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID required' },
        { status: 400 }
      );
    }

    const where: any = { providerId };

    if (active !== null) {
      where.active = active === 'true';
    }

    const staffMembers = await prisma.staffMember.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ staffMembers });
  } catch (error: any) {
    console.error('[API] Failed to fetch staff:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/staff
 * Add a new staff member
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      providerId,
      userId,
      role,
      permissions,
      schedule,
      hireDate,
      commissionRate,
      salary,
    } = body;

    // Validate required fields
    if (!providerId || !userId || !role || !hireDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists as staff
    const existing = await prisma.staffMember.findUnique({
      where: { userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User is already a staff member' },
        { status: 400 }
      );
    }

    const staffMember = await prisma.staffMember.create({
      data: {
        providerId,
        userId,
        role,
        permissions,
        schedule,
        hireDate: new Date(hireDate),
        commissionRate,
        salary,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ staffMember });
  } catch (error: any) {
    console.error('[API] Failed to add staff member:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to add staff member' },
      { status: 500 }
    );
  }
}
