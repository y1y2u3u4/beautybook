'use client';

import { useTestAuth } from '@/hooks/useTestAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Users, Star, Loader2, AlertCircle } from 'lucide-react';

interface Analytics {
  overview: {
    monthlyRevenue: number;
    revenueChange: number;
    totalAppointments: number;
    appointmentsChange: number;
    totalCustomers: number;
    customersChange: number;
    averageRating: number;
    ratingChange: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topServices: Array<{ name: string; bookings: number; revenue: number }>;
  bookingTrends: {
    peakHours: string;
    busiestDay: string;
    avgBookingValue: number;
    cancellationRate: number;
  };
  customerInsights: {
    newCustomers: number;
    newCustomersChange: number;
    returningRate: number;
    avgVisitsPerCustomer: number;
    customerSatisfaction: number;
  };
}

export default function ProviderAnalytics() {
  const { isLoaded, isSignedIn, isTestMode } = useTestAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    if (isLoaded && !isSignedIn && !isTestMode) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, isTestMode, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/provider/analytics');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load analytics');
        }

        setAnalytics(data.analytics);
        setDataSource(data.source || '');
      } catch (err: any) {
        console.error('Failed to fetch analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn || isTestMode) {
      fetchAnalytics();
    }
  }, [isSignedIn, isTestMode]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn && !isTestMode) {
    return null;
  }

  const maxRevenue = analytics ? Math.max(...analytics.monthlyRevenue.map(m => m.revenue), 1) : 1;

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
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  {analytics.overview.revenueChange !== 0 && (
                    <div className={`flex items-center gap-1 ${analytics.overview.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.overview.revenueChange > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {analytics.overview.revenueChange > 0 ? '+' : ''}{analytics.overview.revenueChange}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-1">
                  ${analytics.overview.monthlyRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-neutral-600">This Month</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  {analytics.overview.appointmentsChange !== 0 && (
                    <div className={`flex items-center gap-1 ${analytics.overview.appointmentsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.overview.appointmentsChange > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {analytics.overview.appointmentsChange > 0 ? '+' : ''}{analytics.overview.appointmentsChange}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-1">
                  {analytics.overview.totalAppointments}
                </div>
                <div className="text-sm text-neutral-600">Appointments</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  {analytics.overview.customersChange !== 0 && (
                    <div className={`flex items-center gap-1 ${analytics.overview.customersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.overview.customersChange > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {analytics.overview.customersChange > 0 ? '+' : ''}{analytics.overview.customersChange}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-1">
                  {analytics.overview.totalCustomers}
                </div>
                <div className="text-sm text-neutral-600">Total Customers</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  {analytics.overview.ratingChange !== 0 && (
                    <div className={`flex items-center gap-1 ${analytics.overview.ratingChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.overview.ratingChange > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {analytics.overview.ratingChange > 0 ? '+' : ''}{analytics.overview.ratingChange}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-1">
                  {analytics.overview.averageRating > 0 ? analytics.overview.averageRating : 'N/A'}
                </div>
                <div className="text-sm text-neutral-600">Avg. Rating</div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-6">Monthly Revenue</h2>

              {analytics.monthlyRevenue.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  No revenue data available yet
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.monthlyRevenue.map((data) => (
                    <div key={data.month} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-semibold text-neutral-600">
                        {data.month}
                      </div>
                      <div className="flex-1">
                        <div className="relative h-8 bg-neutral-100 rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-end pr-3"
                            style={{ width: `${Math.max((data.revenue / maxRevenue) * 100, data.revenue > 0 ? 15 : 0)}%` }}
                          >
                            {data.revenue > 0 && (
                              <span className="text-white text-sm font-semibold">
                                ${data.revenue.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Services */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-6">Top Services</h2>

              {analytics.topServices.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  No service data available yet
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.topServices.map((service, index) => (
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
              )}
            </div>

            {/* Additional Metrics */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Booking Trends */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Booking Trends</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Peak Hours</span>
                    <span className="font-semibold">{analytics.bookingTrends.peakHours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Busiest Day</span>
                    <span className="font-semibold">{analytics.bookingTrends.busiestDay}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Avg. Booking Value</span>
                    <span className="font-semibold text-green-600">${analytics.bookingTrends.avgBookingValue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Cancellation Rate</span>
                    <span className="font-semibold text-red-600">{analytics.bookingTrends.cancellationRate}%</span>
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
                      <span className="font-semibold">{analytics.customerInsights.newCustomers}</span>
                      {analytics.customerInsights.newCustomersChange !== 0 && (
                        <div className={`flex items-center gap-1 text-sm ${analytics.customerInsights.newCustomersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analytics.customerInsights.newCustomersChange > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {analytics.customerInsights.newCustomersChange > 0 ? '+' : ''}{analytics.customerInsights.newCustomersChange}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Returning Rate</span>
                    <span className="font-semibold text-green-600">{analytics.customerInsights.returningRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Avg. Visits/Customer</span>
                    <span className="font-semibold">{analytics.customerInsights.avgVisitsPerCustomer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Customer Satisfaction</span>
                    <span className="font-semibold text-yellow-600">{analytics.customerInsights.customerSatisfaction}%</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Data Source Notice */}
        {dataSource === 'mock' && (
          <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">Demo</div>
              <div>
                <div className="font-bold text-yellow-900 mb-1">
                  Demo Mode - Business Analytics
                </div>
                <p className="text-yellow-800 text-sm">
                  This is sample analytics data. Connect to the database to see real business metrics, revenue trends, customer insights, and detailed reports based on your actual data.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
