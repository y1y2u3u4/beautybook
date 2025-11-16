'use client';

import { useTestUser } from '@/hooks/useTestUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Users, Star } from 'lucide-react';

export default function ProviderAnalytics() {
  const { testUser, isTestMode, isLoading } = useTestUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isTestMode || testUser?.role !== 'PROVIDER')) {
      router.push('/test-mode');
    }
  }, [isLoading, isTestMode, testUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!testUser || testUser.role !== 'PROVIDER') {
    return null;
  }

  const monthlyRevenue = [
    { month: 'Jan', revenue: 3200 },
    { month: 'Feb', revenue: 3800 },
    { month: 'Mar', revenue: 4200 },
    { month: 'Apr', revenue: 3900 },
    { month: 'May', revenue: 4500 },
    { month: 'Jun', revenue: 5100 },
  ];

  const topServices = [
    { name: 'Hydrating Facial', bookings: 45, revenue: 6750 },
    { name: 'Anti-Aging Treatment', bookings: 28, revenue: 8400 },
    { name: 'Chemical Peel', bookings: 32, revenue: 8000 },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Business Analytics</h1>
              <p className="text-neutral-600 mt-1">Track your business performance and insights</p>
            </div>
            <Link
              href="/provider/dashboard"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+23%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-neutral-900 mb-1">
              $4,280
            </div>
            <div className="text-sm text-neutral-600">This Month</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+12%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-neutral-900 mb-1">24</div>
            <div className="text-sm text-neutral-600">Appointments</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+8%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-neutral-900 mb-1">156</div>
            <div className="text-sm text-neutral-600">Total Customers</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+0.2</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-neutral-900 mb-1">4.9</div>
            <div className="text-sm text-neutral-600">Avg. Rating</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">Monthly Revenue</h2>

          <div className="space-y-4">
            {monthlyRevenue.map((data) => (
              <div key={data.month} className="flex items-center gap-4">
                <div className="w-12 text-sm font-semibold text-neutral-600">
                  {data.month}
                </div>
                <div className="flex-1">
                  <div className="relative h-8 bg-neutral-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-end pr-3"
                      style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                    >
                      <span className="text-white text-sm font-semibold">
                        ${data.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">Top Services</h2>

          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div key={service.name} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-neutral-900">{service.name}</div>
                  <div className="text-sm text-neutral-600">{service.bookings} bookings</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">${service.revenue.toLocaleString()}</div>
                  <div className="text-sm text-neutral-600">revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Booking Trends</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Peak Hours</span>
                <span className="font-semibold">2PM - 5PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Busiest Day</span>
                <span className="font-semibold">Saturday</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Avg. Booking Value</span>
                <span className="font-semibold text-green-600">$178</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Cancellation Rate</span>
                <span className="font-semibold text-red-600">5.2%</span>
              </div>
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Customer Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">New Customers</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">12</span>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    +25%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Returning Rate</span>
                <span className="font-semibold text-green-600">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Avg. Visits/Customer</span>
                <span className="font-semibold">6.5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Customer Satisfaction</span>
                <span className="font-semibold text-yellow-600">96%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Mode Notice */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧪</div>
            <div>
              <div className="font-bold text-yellow-900 mb-1">
                Test Mode - Business Analytics
              </div>
              <p className="text-yellow-800 text-sm">
                This is sample analytics data. In production, you&apos;ll see real business metrics, revenue trends, customer insights, and detailed reports based on your actual data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
