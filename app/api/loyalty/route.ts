import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper function to calculate membership tier
function calculateTier(points: number): 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' {
  if (points >= 5000) return 'DIAMOND';
  if (points >= 3000) return 'GOLD';
  if (points >= 1000) return 'SILVER';
  return 'BRONZE';
}

// Helper function to get tier benefits
function getTierBenefits(tier: string) {
  const benefits = {
    BRONZE: {
      pointsMultiplier: 1,
      birthdayBonus: 50,
      discounts: ['5% off on birthdays'],
    },
    SILVER: {
      pointsMultiplier: 1.2,
      birthdayBonus: 100,
      discounts: ['10% off on birthdays', 'Priority booking'],
    },
    GOLD: {
      pointsMultiplier: 1.5,
      birthdayBonus: 200,
      discounts: ['15% off on birthdays', 'Priority booking', 'Free rescheduling'],
    },
    DIAMOND: {
      pointsMultiplier: 2,
      birthdayBonus: 500,
      discounts: ['20% off on birthdays', 'Priority booking', 'Free rescheduling', 'Exclusive services'],
    },
  };
  return benefits[tier as keyof typeof benefits] || benefits.BRONZE;
}

// GET /api/loyalty - Get customer loyalty status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with customer profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        customerProfile: {
          include: {
            pointsHistory: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 20,
            },
            rewards: {
              where: {
                used: false,
                expiresAt: {
                  gte: new Date(),
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!user || !user.customerProfile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const profile = user.customerProfile;

    // Calculate next tier threshold
    const currentPoints = profile.loyaltyPoints;
    let nextTier = '';
    let pointsToNextTier = 0;

    if (currentPoints < 1000) {
      nextTier = 'SILVER';
      pointsToNextTier = 1000 - currentPoints;
    } else if (currentPoints < 3000) {
      nextTier = 'GOLD';
      pointsToNextTier = 3000 - currentPoints;
    } else if (currentPoints < 5000) {
      nextTier = 'DIAMOND';
      pointsToNextTier = 5000 - currentPoints;
    }

    // Get referral stats
    const referralCount = await prisma.customerProfile.count({
      where: {
        referredByCode: profile.referralCode,
      },
    });

    return NextResponse.json({
      loyaltyStatus: {
        points: profile.loyaltyPoints,
        tier: profile.membershipTier,
        totalSpent: profile.totalSpent,
        referralCode: profile.referralCode,
        referralCount,
        nextTier,
        pointsToNextTier,
        benefits: getTierBenefits(profile.membershipTier),
      },
      recentTransactions: profile.pointsHistory,
      availableRewards: profile.rewards,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?ref=${profile.referralCode}`,
    });
  } catch (error: any) {
    console.error('Error fetching loyalty status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty status' },
      { status: 500 }
    );
  }
}

// POST /api/loyalty - Award points (called after successful booking)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentId, amount } = body;

    if (!appointmentId || !amount) {
      return NextResponse.json(
        { error: 'Appointment ID and amount are required' },
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

    // Calculate points ($1 = 1 point, with tier multiplier)
    const basePoints = Math.floor(amount);
    const tierBenefits = getTierBenefits(user.customerProfile.membershipTier);
    const points = Math.floor(basePoints * tierBenefits.pointsMultiplier);

    // Award points
    const updatedProfile = await prisma.customerProfile.update({
      where: { id: user.customerProfile.id },
      data: {
        loyaltyPoints: {
          increment: points,
        },
        totalSpent: {
          increment: amount,
        },
        membershipTier: calculateTier(user.customerProfile.loyaltyPoints + points),
      },
    });

    // Record transaction
    await prisma.loyaltyTransaction.create({
      data: {
        customerProfileId: user.customerProfile.id,
        type: 'EARNED_BOOKING',
        points,
        description: `Earned ${points} points from booking`,
        relatedId: appointmentId,
      },
    });

    return NextResponse.json({
      success: true,
      pointsAwarded: points,
      newTotal: updatedProfile.loyaltyPoints,
      newTier: updatedProfile.membershipTier,
    });
  } catch (error: any) {
    console.error('Error awarding loyalty points:', error);
    return NextResponse.json(
      { error: 'Failed to award points' },
      { status: 500 }
    );
  }
}
