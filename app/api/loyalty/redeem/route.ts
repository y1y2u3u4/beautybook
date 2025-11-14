import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Reward catalog with point costs
const REWARD_CATALOG = {
  DISCOUNT_10: { points: 500, discount: 0.10, description: '10% off your next booking' },
  DISCOUNT_15: { points: 750, discount: 0.15, description: '15% off your next booking' },
  DISCOUNT_20: { points: 1000, discount: 0.20, description: '20% off your next booking' },
  FREE_SERVICE: { points: 2000, discount: 1.0, description: 'Free service up to $100' },
};

// POST /api/loyalty/redeem - Redeem points for rewards
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rewardType } = body;

    if (!rewardType || !REWARD_CATALOG[rewardType as keyof typeof REWARD_CATALOG]) {
      return NextResponse.json(
        { error: 'Invalid reward type' },
        { status: 400 }
      );
    }

    // Get user with customer profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { customerProfile: true },
    });

    if (!user || !user.customerProfile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const reward = REWARD_CATALOG[rewardType as keyof typeof REWARD_CATALOG];

    // Check if user has enough points
    if (user.customerProfile.loyaltyPoints < reward.points) {
      return NextResponse.json(
        {
          error: 'Insufficient points',
          required: reward.points,
          current: user.customerProfile.loyaltyPoints,
        },
        { status: 400 }
      );
    }

    // Deduct points
    const updatedProfile = await prisma.customerProfile.update({
      where: { id: user.customerProfile.id },
      data: {
        loyaltyPoints: {
          decrement: reward.points,
        },
      },
    });

    // Record transaction
    await prisma.loyaltyTransaction.create({
      data: {
        customerProfileId: user.customerProfile.id,
        type: 'SPENT_REWARD',
        points: -reward.points,
        description: `Redeemed: ${reward.description}`,
      },
    });

    // Create reward redemption (expires in 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const redemption = await prisma.rewardRedemption.create({
      data: {
        customerProfileId: user.customerProfile.id,
        rewardType,
        pointsSpent: reward.points,
        discountAmount: reward.discount,
        description: reward.description,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      redemption: {
        id: redemption.id,
        type: rewardType,
        description: reward.description,
        discountAmount: reward.discount,
        expiresAt: redemption.expiresAt,
      },
      remainingPoints: updatedProfile.loyaltyPoints,
    });
  } catch (error: any) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json(
      { error: 'Failed to redeem reward' },
      { status: 500 }
    );
  }
}

// GET /api/loyalty/redeem - Get available rewards catalog
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current points
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { customerProfile: true },
    });

    if (!user || !user.customerProfile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const currentPoints = user.customerProfile.loyaltyPoints;

    // Build reward catalog with availability
    const catalog = Object.entries(REWARD_CATALOG).map(([type, reward]) => ({
      type,
      points: reward.points,
      discount: reward.discount,
      description: reward.description,
      available: currentPoints >= reward.points,
      pointsNeeded: Math.max(0, reward.points - currentPoints),
    }));

    return NextResponse.json({
      catalog,
      currentPoints,
    });
  } catch (error: any) {
    console.error('Error fetching reward catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}
