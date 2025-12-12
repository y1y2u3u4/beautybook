import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
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
 * GET /api/users/profile
 * Get current user's profile
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

    // Get Clerk user data
    const clerkUser = await currentUser();

    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      // Return Clerk data only
      return NextResponse.json({
        user: {
          id: clerkUserId,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress || '',
          firstName: clerkUser?.firstName || '',
          lastName: clerkUser?.lastName || '',
          imageUrl: clerkUser?.imageUrl || '',
          phone: clerkUser?.phoneNumbers?.[0]?.phoneNumber || '',
        },
        source: 'clerk',
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        providerProfile: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    if (!user) {
      // Return Clerk data if no database record
      return NextResponse.json({
        user: {
          id: clerkUserId,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress || '',
          firstName: clerkUser?.firstName || '',
          lastName: clerkUser?.lastName || '',
          imageUrl: clerkUser?.imageUrl || '',
          phone: clerkUser?.phoneNumbers?.[0]?.phoneNumber || '',
        },
        source: 'clerk',
        needsSync: true,
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl || clerkUser?.imageUrl || '',
        role: user.role,
        isProvider: !!user.providerProfile,
        providerProfile: user.providerProfile,
        createdAt: user.createdAt,
      },
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to get user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
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
        message: 'Profile update simulated (demo mode)',
      });
    }

    const body = await request.json();
    const { firstName, lastName, phone } = body;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      // Get Clerk user to create database record
      const clerkUser = await currentUser();
      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress || '',
          firstName: firstName || clerkUser?.firstName || '',
          lastName: lastName || clerkUser?.lastName || '',
          imageUrl: clerkUser?.imageUrl || '',
          role: 'CUSTOMER',
        },
      });
    } else {
      // Update user
      user = await prisma.user.update({
        where: { clerkId: clerkUserId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to update user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
