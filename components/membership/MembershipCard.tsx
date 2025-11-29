'use client';

import { Crown, Star, Sparkles, ChevronRight, Gift, TrendingUp } from 'lucide-react';
import {
  MembershipTier,
  UserMembership,
  getMembershipLevel,
  getNextMembershipLevel,
  formatPoints,
  membershipLevels,
} from '@/lib/membership';

interface MembershipCardProps {
  membership: UserMembership;
  compact?: boolean;
  onViewRewards?: () => void;
}

export default function MembershipCard({ membership, compact = false, onViewRewards }: MembershipCardProps) {
  const currentLevel = getMembershipLevel(membership.lifetimePoints);
  const nextLevel = getNextMembershipLevel(membership.tier);

  const tierColors: Record<MembershipTier, { bg: string; text: string; gradient: string }> = {
    bronze: {
      bg: 'from-amber-600 to-amber-700',
      text: 'text-amber-100',
      gradient: 'from-amber-400 to-amber-600',
    },
    silver: {
      bg: 'from-slate-400 to-slate-500',
      text: 'text-slate-100',
      gradient: 'from-slate-300 to-slate-500',
    },
    gold: {
      bg: 'from-yellow-500 to-amber-500',
      text: 'text-yellow-100',
      gradient: 'from-yellow-300 to-yellow-500',
    },
    platinum: {
      bg: 'from-slate-700 to-slate-800',
      text: 'text-slate-200',
      gradient: 'from-slate-400 to-slate-600',
    },
  };

  const colors = tierColors[membership.tier];

  if (compact) {
    return (
      <div className={`bg-gradient-to-r ${colors.bg} rounded-2xl p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm opacity-80">{currentLevel.name} Member</div>
              <div className="font-bold">{formatPoints(membership.currentPoints)} pts</div>
            </div>
          </div>
          <button
            onClick={onViewRewards}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            <Gift className="w-4 h-4" />
            Rewards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-3xl p-6 text-white relative overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5" />
            <span className="text-sm font-medium opacity-80">BeautyBook Rewards</span>
          </div>
          <h3 className="text-2xl font-bold">{currentLevel.name} Member</h3>
        </div>
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* Points */}
      <div className="relative mb-6">
        <div className="text-sm opacity-80 mb-1">Available Points</div>
        <div className="text-4xl font-bold">{formatPoints(membership.currentPoints)}</div>
        <div className="text-sm opacity-80 mt-1">
          Lifetime: {formatPoints(membership.lifetimePoints)} points
        </div>
      </div>

      {/* Progress to next tier */}
      {nextLevel && (
        <div className="relative mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="opacity-80">Progress to {nextLevel.name}</span>
            <span className="font-medium">
              {formatPoints(membership.lifetimePoints)} / {formatPoints(nextLevel.minPoints)}
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(membership.tierProgress, 100)}%` }}
            />
          </div>
          <div className="text-xs opacity-80 mt-2">
            {membership.pointsToNextTier !== null && (
              <span>{formatPoints(membership.pointsToNextTier)} points to {nextLevel.name}</span>
            )}
          </div>
        </div>
      )}

      {/* Benefits preview */}
      <div className="relative mb-6">
        <div className="text-sm font-medium mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" />
          Your Benefits
        </div>
        <div className="grid grid-cols-2 gap-2">
          {currentLevel.benefits.slice(0, 4).map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs bg-white/10 rounded-lg px-3 py-2"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
              <span className="truncate">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative flex gap-3">
        <button
          onClick={onViewRewards}
          className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl py-3 font-semibold transition-colors"
        >
          <Gift className="w-5 h-5" />
          View Rewards
        </button>
        <button className="flex items-center justify-center gap-2 bg-white text-neutral-800 rounded-xl px-4 py-3 font-semibold hover:bg-white/90 transition-colors">
          <TrendingUp className="w-5 h-5" />
          Earn More
        </button>
      </div>
    </div>
  );
}
