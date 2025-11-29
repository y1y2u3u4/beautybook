// Membership Types and Configuration

export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface MembershipLevel {
  tier: MembershipTier;
  name: string;
  minPoints: number;
  maxPoints: number | null;
  color: string;
  benefits: string[];
  pointsMultiplier: number;
  discountPercentage: number;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus';
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: 'appointment' | 'referral' | 'promotion' | 'review';
  createdAt: Date;
  expiresAt?: Date;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'free_service' | 'upgrade' | 'gift';
  value: number;
  valueType: 'percentage' | 'fixed' | 'service';
  minTier?: MembershipTier;
  isAvailable: boolean;
  expiresAt?: Date;
  imageUrl?: string;
}

export interface UserMembership {
  userId: string;
  currentPoints: number;
  lifetimePoints: number;
  tier: MembershipTier;
  tierProgress: number;
  pointsToNextTier: number | null;
  memberSince: Date;
  lastActivityAt: Date;
}

// Membership tier configuration
export const membershipLevels: MembershipLevel[] = [
  {
    tier: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 999,
    color: '#CD7F32',
    benefits: [
      'Earn 1 point per $1 spent',
      'Birthday bonus points',
      'Exclusive member-only promotions',
    ],
    pointsMultiplier: 1,
    discountPercentage: 0,
  },
  {
    tier: 'silver',
    name: 'Silver',
    minPoints: 1000,
    maxPoints: 4999,
    color: '#C0C0C0',
    benefits: [
      'Earn 1.25 points per $1 spent',
      'Birthday bonus points (2x)',
      '5% discount on all services',
      'Priority booking access',
    ],
    pointsMultiplier: 1.25,
    discountPercentage: 5,
  },
  {
    tier: 'gold',
    name: 'Gold',
    minPoints: 5000,
    maxPoints: 14999,
    color: '#FFD700',
    benefits: [
      'Earn 1.5 points per $1 spent',
      'Birthday bonus points (3x)',
      '10% discount on all services',
      'Priority booking access',
      'Free cancellation up to 12 hours',
      'Exclusive Gold member events',
    ],
    pointsMultiplier: 1.5,
    discountPercentage: 10,
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    minPoints: 15000,
    maxPoints: null,
    color: '#E5E4E2',
    benefits: [
      'Earn 2 points per $1 spent',
      'Birthday bonus points (5x)',
      '15% discount on all services',
      'Priority booking access',
      'Free cancellation anytime',
      'Exclusive Platinum concierge',
      'Complimentary upgrades when available',
      'VIP access to new services',
    ],
    pointsMultiplier: 2,
    discountPercentage: 15,
  },
];

// Points configuration
export const pointsConfig = {
  basePointsPerDollar: 1,
  referralBonus: 500,
  reviewBonus: 50,
  firstBookingBonus: 100,
  birthdayBonus: 200,
  pointsExpirationDays: 365,
};

// Sample rewards
export const availableRewards: Reward[] = [
  {
    id: 'reward-1',
    name: '$10 Off',
    description: 'Get $10 off your next booking',
    pointsCost: 500,
    type: 'discount',
    value: 10,
    valueType: 'fixed',
    isAvailable: true,
  },
  {
    id: 'reward-2',
    name: '$25 Off',
    description: 'Get $25 off your next booking',
    pointsCost: 1000,
    type: 'discount',
    value: 25,
    valueType: 'fixed',
    isAvailable: true,
  },
  {
    id: 'reward-3',
    name: '15% Off',
    description: 'Get 15% off your next booking',
    pointsCost: 750,
    type: 'discount',
    value: 15,
    valueType: 'percentage',
    isAvailable: true,
  },
  {
    id: 'reward-4',
    name: 'Free Express Facial',
    description: 'Redeem for a complimentary 30-min express facial',
    pointsCost: 2000,
    type: 'free_service',
    value: 60,
    valueType: 'fixed',
    minTier: 'silver',
    isAvailable: true,
  },
  {
    id: 'reward-5',
    name: 'Service Upgrade',
    description: 'Upgrade to premium service tier for free',
    pointsCost: 1500,
    type: 'upgrade',
    value: 50,
    valueType: 'fixed',
    minTier: 'gold',
    isAvailable: true,
  },
  {
    id: 'reward-6',
    name: 'Luxury Gift Set',
    description: 'Premium skincare gift set',
    pointsCost: 5000,
    type: 'gift',
    value: 150,
    valueType: 'fixed',
    minTier: 'platinum',
    isAvailable: true,
  },
];

// Helper functions
export function getMembershipLevel(points: number): MembershipLevel {
  for (let i = membershipLevels.length - 1; i >= 0; i--) {
    if (points >= membershipLevels[i].minPoints) {
      return membershipLevels[i];
    }
  }
  return membershipLevels[0];
}

export function getNextMembershipLevel(currentTier: MembershipTier): MembershipLevel | null {
  const currentIndex = membershipLevels.findIndex(l => l.tier === currentTier);
  if (currentIndex < membershipLevels.length - 1) {
    return membershipLevels[currentIndex + 1];
  }
  return null;
}

export function calculatePointsForBooking(amount: number, tier: MembershipTier): number {
  const level = membershipLevels.find(l => l.tier === tier);
  if (!level) return Math.floor(amount);
  return Math.floor(amount * level.pointsMultiplier);
}

export function calculateDiscount(amount: number, tier: MembershipTier): number {
  const level = membershipLevels.find(l => l.tier === tier);
  if (!level) return 0;
  return amount * (level.discountPercentage / 100);
}

export function formatPoints(points: number): string {
  if (points >= 10000) {
    return (points / 1000).toFixed(1) + 'K';
  }
  return points.toLocaleString();
}

export function canRedeemReward(reward: Reward, userTier: MembershipTier, userPoints: number): boolean {
  if (userPoints < reward.pointsCost) return false;
  if (!reward.isAvailable) return false;
  if (reward.minTier) {
    const rewardTierIndex = membershipLevels.findIndex(l => l.tier === reward.minTier);
    const userTierIndex = membershipLevels.findIndex(l => l.tier === userTier);
    if (userTierIndex < rewardTierIndex) return false;
  }
  return true;
}
