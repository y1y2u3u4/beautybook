'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Gift,
  TrendingUp,
  DollarSign,
  Percent,
  Share2,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ReferralProgram {
  id: string;
  active: boolean;
  referrerRewardType: 'PERCENTAGE' | 'FIXED';
  referrerRewardValue: number;
  refereeRewardType: 'PERCENTAGE' | 'FIXED';
  refereeRewardValue: number;
  minPurchaseAmount: number | null;
  referralExpireDays: number;
}

export default function ReferralsPage() {
  const [program, setProgram] = useState<ReferralProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    fetchReferralProgram();
  }, []);

  const fetchReferralProgram = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing/referrals/program');
      if (response.ok) {
        const data = await response.json();
        setProgram(data.program);
      }
    } catch (error) {
      console.error('Error fetching referral program:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatReward = (type: string, value: number) => {
    return type === 'PERCENTAGE' ? `${value}% off` : `$${value}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/provider/dashboard"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Referral Program</h1>
              <p className="text-neutral-600 mt-2">
                Reward customers for bringing new business
              </p>
            </div>
          </div>
        </div>

        {!program ? (
          /* Setup Referral Program */
          <div className="card text-center py-12 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Start Your Referral Program
            </h2>
            <p className="text-neutral-600 mb-8 max-w-lg mx-auto">
              Create a referral program to incentivize your customers to share your business
              with their friends and family. Both the referrer and referee will receive rewards!
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">How it Works</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div className="text-sm text-blue-900">
                    <strong>Customer shares</strong> their unique referral link
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div className="text-sm text-blue-900">
                    <strong>Friend books</strong> using the referral link
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div className="text-sm text-blue-900">
                    <strong>Both receive rewards</strong> when the appointment is completed
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-primary">
              Set Up Referral Program
            </button>
            <p className="text-xs text-neutral-500 mt-4">
              Program setup functionality coming soon
            </p>
          </div>
        ) : (
          <>
            {/* Program Overview */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Referrer Reward */}
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">Referrer Reward</h3>
                    <p className="text-sm text-neutral-600">For the person who shares</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatReward(program.referrerRewardType, program.referrerRewardValue)}
                </div>
                <p className="text-sm text-neutral-600">
                  Reward given when their friend completes first appointment
                </p>
              </div>

              {/* Referee Reward */}
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">New Customer Reward</h3>
                    <p className="text-sm text-neutral-600">For the referred friend</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatReward(program.refereeRewardType, program.refereeRewardValue)}
                </div>
                <p className="text-sm text-neutral-600">
                  Discount applied to their first appointment
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">—</div>
                <div className="text-sm text-neutral-600">Total Referrals</div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">—</div>
                <div className="text-sm text-neutral-600">Completed</div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">—</div>
                <div className="text-sm text-neutral-600">Pending</div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">—</div>
                <div className="text-sm text-neutral-600">Conversion Rate</div>
              </div>
            </div>

            {/* Recent Referrals */}
            <div className="card">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Recent Referrals</h2>
              <div className="text-center py-12 text-neutral-600">
                <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p>No referrals yet</p>
                <p className="text-sm mt-2">
                  Customers will be able to share their referral links soon
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
