'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Crown,
  Gift,
  History,
  Sparkles,
  TrendingUp,
  Star,
  ChevronRight,
  Calendar,
  Users,
  MessageSquare,
} from 'lucide-react';
import MembershipCard from '@/components/membership/MembershipCard';
import RewardsGrid from '@/components/membership/RewardsGrid';
import {
  UserMembership,
  Reward,
  availableRewards,
  membershipLevels,
  PointsTransaction,
  formatPoints,
} from '@/lib/membership';

// Mock user membership data
const mockMembership: UserMembership = {
  userId: 'user-1',
  currentPoints: 2350,
  lifetimePoints: 3850,
  tier: 'silver',
  tierProgress: 77,
  pointsToNextTier: 1150,
  memberSince: new Date('2023-06-15'),
  lastActivityAt: new Date(),
};

// Mock transaction history
const mockTransactions: PointsTransaction[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    type: 'earn',
    amount: 150,
    description: 'Facial Treatment booking',
    referenceType: 'appointment',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    type: 'bonus',
    amount: 500,
    description: 'Referral bonus - Sarah joined',
    referenceType: 'referral',
    createdAt: new Date('2024-01-18'),
  },
  {
    id: 'tx-3',
    userId: 'user-1',
    type: 'redeem',
    amount: -500,
    description: 'Redeemed $10 Off coupon',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'tx-4',
    userId: 'user-1',
    type: 'earn',
    amount: 85,
    description: 'Hair Styling booking',
    referenceType: 'appointment',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'tx-5',
    userId: 'user-1',
    type: 'earn',
    amount: 50,
    description: 'Review bonus',
    referenceType: 'review',
    createdAt: new Date('2024-01-08'),
  },
];

// Ways to earn points
const earnMethods = [
  {
    icon: <Calendar className="w-5 h-5" />,
    title: 'Book Services',
    description: 'Earn 1 point per $1 spent',
    points: '1pt/$1',
    color: 'primary',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Refer Friends',
    description: 'Earn 500 points per referral',
    points: '500 pts',
    color: 'secondary',
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'Write Reviews',
    description: 'Earn 50 points per review',
    points: '50 pts',
    color: 'accent',
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: 'Complete Profile',
    description: 'One-time bonus',
    points: '100 pts',
    color: 'primary',
  },
];

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<'rewards' | 'history' | 'tiers'>('rewards');
  const [membership] = useState<UserMembership>(mockMembership);

  const handleRedeem = async (reward: Reward): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const currentLevel = membershipLevels.find(l => l.tier === membership.tier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/customer/appointments"
              className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Rewards</h1>
              <p className="text-sm text-neutral-500">Earn points, unlock rewards</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Membership Card */}
        <MembershipCard
          membership={membership}
          onViewRewards={() => setActiveTab('rewards')}
        />

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'rewards'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Gift className="w-4 h-4" />
            Rewards
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'tiers'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Crown className="w-4 h-4" />
            Tiers
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Ways to Earn */}
            <div className="card-glass">
              <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Ways to Earn Points
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {earnMethods.map((method, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      method.color === 'primary' ? 'bg-primary-100 text-primary-600' :
                      method.color === 'secondary' ? 'bg-secondary-100 text-secondary-600' :
                      'bg-accent-100 text-accent-600'
                    }`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">{method.title}</div>
                      <div className="text-xs text-neutral-500">{method.description}</div>
                    </div>
                    <div className="text-sm font-bold text-primary-600">{method.points}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Rewards */}
            <div className="card-glass">
              <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary-500" />
                Available Rewards
              </h3>
              <RewardsGrid
                rewards={availableRewards}
                userPoints={membership.currentPoints}
                userTier={membership.tier}
                onRedeem={handleRedeem}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card-glass">
            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-primary-500" />
              Points History
            </h3>
            <div className="space-y-3">
              {mockTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'earn' ? 'bg-green-100 text-green-600' :
                      tx.type === 'bonus' ? 'bg-purple-100 text-purple-600' :
                      tx.type === 'redeem' ? 'bg-blue-100 text-blue-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {tx.type === 'earn' ? <TrendingUp className="w-5 h-5" /> :
                       tx.type === 'bonus' ? <Sparkles className="w-5 h-5" /> :
                       tx.type === 'redeem' ? <Gift className="w-5 h-5" /> :
                       <History className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{tx.description}</div>
                      <div className="text-xs text-neutral-500">
                        {tx.createdAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    tx.amount > 0 ? 'text-green-600' : 'text-neutral-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{formatPoints(tx.amount)} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tiers' && (
          <div className="space-y-4">
            {membershipLevels.map((level, index) => {
              const isCurrentTier = level.tier === membership.tier;
              const isUnlocked = membership.lifetimePoints >= level.minPoints;

              return (
                <div
                  key={level.tier}
                  className={`card-glass relative overflow-hidden ${
                    isCurrentTier ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  {isCurrentTier && (
                    <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-xl">
                      Current Tier
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: level.color + '20' }}
                    >
                      <Crown className="w-7 h-7" style={{ color: level.color }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-neutral-900">{level.name}</h4>
                        {!isUnlocked && (
                          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                            Locked
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-neutral-600 mb-3">
                        {level.maxPoints
                          ? `${formatPoints(level.minPoints)} - ${formatPoints(level.maxPoints)} lifetime points`
                          : `${formatPoints(level.minPoints)}+ lifetime points`}
                      </p>

                      <div className="space-y-1.5">
                        {level.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: level.color }}
                            />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
