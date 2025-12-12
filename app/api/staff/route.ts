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

// Mock staff data for demo mode
const mockStaff = [
  {
    id: 'mock_staff_1',
    userId: 'mock_user_1',
    role: 'STYLIST',
    specialties: ['Hair Styling', 'Coloring'],
    commission: 50,
    commissionRate: 50,
    active: true,
    createdAt: new Date().toISOString(),
    user: {
      id: 'mock_user_1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      imageUrl: null,
    },
  },
  {
    id: 'mock_staff_2',
    userId: 'mock_user_2',
    role: 'ESTHETICIAN',
    specialties: ['Facials', 'Skincare'],
    commission: 45,
    commissionRate: 45,
    active: true,
    createdAt: new Date().toISOString(),
    user: {
      id: 'mock_user_2',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike@example.com',
      imageUrl: null,
    },
  },
  {
    id: 'mock_staff_3',
    userId: 'mock_user_3',
    role: 'NAIL_TECH',
    specialties: ['Manicure', 'Pedicure', 'Nail Art'],
    commission: 40,
    commissionRate: 40,
    active: true,
    createdAt: new Date().toISOString(),
    user: {
      id: 'mock_user_3',
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma@example.com',
      imageUrl: null,
    },
  },
];

/**
 * GET /api/staff
 * Get staff members for current provider
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    // If providerId is provided (public query), allow without auth
    // Otherwise require auth for current user's staff
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return NextResponse.json({
        staff: mockStaff,
        staffMembers: mockStaff, // For backward compatibility
        source: 'mock',
      });
    }

    let targetProviderId = providerId;

    // If no providerId provided, get current user's provider
    if (!providerId && clerkUserId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        include: { providerProfile: true },
      });

      if (user?.providerProfile) {
        targetProviderId = user.providerProfile.id;
      }
    }

    if (!targetProviderId) {
      return NextResponse.json({
        staff: [],
        staffMembers: [],
        source: 'database',
      });
    }

    const staff = await prisma.staffMember.findMany({
      where: { providerId: targetProviderId },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      staff,
      staffMembers: staff, // For backward compatibility
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to get staff:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get staff' },
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
          id: `mock_staff_${Date.now()}`,
          ...body,
          active: true,
          createdAt: new Date().toISOString(),
          user: {
            id: `mock_user_${Date.now()}`,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
          },
        },
        source: 'mock',
        message: 'Staff member added (demo mode)',
      });
    }

    const { email, firstName, lastName, role, specialties, commissionRate, salary } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, firstName, lastName, role' },
        { status: 400 }
      );
    }

    // Get provider profile
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

    // Check if user already exists
    let staffUser = await prisma.user.findUnique({
      where: { email },
    });

    // Create user if not exists
    if (!staffUser) {
      staffUser = await prisma.user.create({
        data: {
          clerkId: `staff_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          email,
          firstName,
          lastName,
          role: 'CUSTOMER', // Staff users default to CUSTOMER role
        },
      });
    }

    // Check if already a staff member for this provider
    const existingStaff = await prisma.staffMember.findFirst({
      where: {
        userId: staffUser.id,
        providerId: user.providerProfile.id,
      },
    });

    if (existingStaff) {
      return NextResponse.json(
        { error: 'This person is already a staff member' },
        { status: 400 }
      );
    }

    // Create staff member
    const staffMember = await prisma.staffMember.create({
      data: {
        userId: staffUser.id,
        providerId: user.providerProfile.id,
        role,
        commissionRate: commissionRate || 0,
        salary: salary || 0,
        active: true,
        hireDate: new Date(),
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
      staff: staffMember,
      staffMember, // For backward compatibility
      source: 'database',
    });
  } catch (error: any) {
    console.error('[API] Failed to add staff:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add staff' },
      { status: 500 }
    );
  }
}
