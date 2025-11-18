import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/marketing/coupons - Get all coupons for provider
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

    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Get all coupons for this provider
    const coupons = await prisma.coupon.findMany({
      where: { providerId: user.providerProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/marketing/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      code,
      name,
      description,
      type,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
      applicableServices,
      newCustomersOnly,
    } = body;

    // Validate required fields
    if (!code || !name || !type || !discountType || !discountValue || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        providerId: user.providerProfile.id,
        code: code.toUpperCase(),
        name,
        description,
        type,
        discountType,
        discountValue,
        maxDiscount,
        minPurchase,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        usageLimit,
        perUserLimit,
        applicableServices: applicableServices || [],
        newCustomersOnly: newCustomersOnly || false,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
