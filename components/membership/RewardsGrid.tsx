'use client';

import { useState } from 'react';
import {
  Gift,
  Tag,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Star,
} from 'lucide-react';
import {
  Reward,
  MembershipTier,
  canRedeemReward,
  formatPoints,
  membershipLevels,
} from '@/lib/membership';

interface RewardsGridProps {
  rewards: Reward[];
  userPoints: number;
  userTier: MembershipTier;
  onRedeem: (reward: Reward) => Promise<boolean>;
}

export default function RewardsGrid({ rewards, userPoints, userTier, onRedeem }: RewardsGridProps) {
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async (reward: Reward) => {
    if (!canRedeemReward(reward, userTier, userPoints)) return;

    setRedeeming(reward.id);
    setError(null);

    try {
      const success = await onRedeem(reward);
      if (success) {
        setRedeemed([...redeemed, reward.id]);
      } else {
        setError('Failed to redeem reward. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardIcon = (type: Reward['type']) => {
    switch (type) {
      case 'discount':
        return <Tag className="w-6 h-6" />;
      case 'free_service':
        return <Sparkles className="w-6 h-6" />;
      case 'upgrade':
        return <Star className="w-6 h-6" />;
      case 'gift':
        return <Gift className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  const getRewardTypeLabel = (type: Reward['type']) => {
    switch (type) {
      case 'discount':
        return 'Discount';
      case 'free_service':
        return 'Free Service';
      case 'upgrade':
        return 'Upgrade';
      case 'gift':
        return 'Gift';
      default:
        return 'Reward';
    }
  };

  const getTierName = (tier: MembershipTier) => {
    return membershipLevels.find(l => l.tier === tier)?.name || tier;
  };

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-100">
        <div>
          <div className="text-sm text-neutral-600">Available Points</div>
          <div className="text-2xl font-bold text-neutral-900">{formatPoints(userPoints)}</div>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const canRedeem = canRedeemReward(reward, userTier, userPoints);
          const isRedeemed = redeemed.includes(reward.id);
          const isRedeeming = redeeming === reward.id;
          const needsHigherTier = reward.minTier &&
            membershipLevels.findIndex(l => l.tier === userTier) <
            membershipLevels.findIndex(l => l.tier === reward.minTier);

          return (
            <div
              key={reward.id}
              className={`relative border rounded-2xl overflow-hidden transition-all ${
                isRedeemed
                  ? 'border-green-200 bg-green-50'
                  : canRedeem
                  ? 'border-neutral-200 hover:border-primary-300 hover:shadow-lg bg-white'
                  : 'border-neutral-100 bg-neutral-50 opacity-75'
              }`}
            >
              {/* Type Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  reward.type === 'discount' ? 'bg-blue-100 text-blue-700' :
                  reward.type === 'free_service' ? 'bg-purple-100 text-purple-700' :
                  reward.type === 'upgrade' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-pink-100 text-pink-700'
                }`}>
                  {getRewardTypeLabel(reward.type)}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  canRedeem
                    ? 'bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600'
                    : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {getRewardIcon(reward.type)}
                </div>

                <h4 className="font-bold text-neutral-900 mb-1">{reward.name}</h4>
                <p className="text-sm text-neutral-600 mb-4">{reward.description}</p>

                {/* Min Tier Requirement */}
                {reward.minTier && (
                  <div className={`flex items-center gap-1 text-xs mb-3 ${
                    needsHigherTier ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {needsHigherTier ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Requires {getTierName(reward.minTier)} tier</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{getTierName(reward.minTier)}+ exclusive</span>
                      </>
                    )}
                  </div>
                )}

                {/* Points Cost & Button */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div>
                    <span className="text-lg font-bold text-neutral-900">
                      {formatPoints(reward.pointsCost)}
                    </span>
                    <span className="text-sm text-neutral-500 ml-1">pts</span>
                  </div>

                  {isRedeemed ? (
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      Redeemed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canRedeem || isRedeeming}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        canRedeem
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg'
                          : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      {isRedeeming ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : canRedeem ? (
                        'Redeem'
                      ) : userPoints < reward.pointsCost ? (
                        'Not enough points'
                      ) : (
                        'Locked'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
