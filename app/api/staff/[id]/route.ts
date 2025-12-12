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

/**
 * GET /api/staff/[id]
 * Get a specific staff member
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return NextResponse.json({
        staff: {
          id: params.id,
          role: 'STYLIST',
          specialties: ['Hair Styling'],
          active: true,
          user: {
            firstName: 'Demo',
            lastName: 'Staff',
            email: 'demo@example.com',
          },
        },
        source: 'mock',
      });
    }

    const staff = await prisma.staffMember.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      staff,
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to get staff member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get staff member' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/staff/[id]
 * Update a staff member
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbAvailable = await isDatabaseAvailable();
    const body = await request.json();

    if (!dbAvailable) {
      return NextResponse.json({
        success: true,
        staff: {
          id: params.id,
          ...body,
        },
        source: 'mock',
        message: 'Staff member updated (demo mode)',
      });
    }

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Check if staff belongs to this provider
    const existingStaff = await prisma.staffMember.findFirst({
      where: {
        id: params.id,
        providerId: user.providerProfile.id,
      },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update staff member
    const { role, commissionRate, salary, active } = body;

    const updatedStaff = await prisma.staffMember.update({
      where: { id: params.id },
      data: {
        ...(role && { role }),
        ...(commissionRate !== undefined && { commissionRate }),
        ...(salary !== undefined && { salary }),
        ...(active !== undefined && { active }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      staff: updatedStaff,
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to update staff member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/staff/[id]
 * Remove a staff member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        success: true,
        source: 'mock',
        message: 'Staff member removed (demo mode)',
      });
    }

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Check if staff belongs to this provider
    const existingStaff = await prisma.staffMember.findFirst({
      where: {
        id: params.id,
        providerId: user.providerProfile.id,
      },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete staff member
    await prisma.staffMember.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member removed',
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to delete staff member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
