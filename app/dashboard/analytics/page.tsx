'use client';

import { useState, useEffect } from 'react';
import { BarChart, TrendingUp, DollarSign, Calendar, Users, Star, Clock, AlertCircle } from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalTips: number;
    totalBookings: number;
    avgBookingValue: number;
    retentionRate: number;
    cancellationRate: number;
    avgRating: number;
    totalReviews: number;
  };
  revenue: {
    daily: Array<{
      date: string;
      amount: number;
      bookings: number;
    }>;
  };
  services: Array<{
    serviceName: string;
    bookings: number;
    revenue: number;
  }>;
  staff: Array<{
    staffName: string;
    bookings: number;
    revenue: number;
    tips: number;
    totalEarnings: number;
  }>;
  status: Array<{
    status: string;
    count: number;
  }>;
  peakHours: Array<{
    hour: string;
    bookings: number;
  }>;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?range=${range}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const exportData = () => {
    if (!analytics) return;

    const csvContent = [
      ['Analytics Report'],
      ['Date Range', `${new Date(analytics.dateRange.start).toLocaleDateString()} - ${new Date(analytics.dateRange.end).toLocaleDateString()}`],
      [''],
      ['Summary'],
      ['Total Revenue', formatCurrency(analytics.summary.totalRevenue)],
      ['Total Tips', formatCurrency(analytics.summary.totalTips)],
      ['Total Bookings', analytics.summary.totalBookings.toString()],
      ['Avg Booking Value', formatCurrency(analytics.summary.avgBookingValue)],
      ['Retention Rate', `${analytics.summary.retentionRate}%`],
      ['Cancellation Rate', `${analytics.summary.cancellationRate}%`],
      ['Avg Rating', analytics.summary.avgRating.toFixed(1)],
      [''],
      ['Daily Revenue'],
      ['Date', 'Revenue', 'Bookings'],
      ...analytics.revenue.daily.map((d) => [d.date, d.amount.toString(), d.bookings.toString()]),
      [''],
      ['Service Performance'],
      ['Service', 'Bookings', 'Revenue'],
      ...analytics.services.map((s) => [s.serviceName, s.bookings.toString(), s.revenue.toString()]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p>Failed to load analytics data.</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...analytics.revenue.daily.map((d) => d.amount));

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Analytics Dashboard</h1>
            <p className="text-neutral-600">
              {new Date(analytics.dateRange.start).toLocaleDateString()} -{' '}
              {new Date(analytics.dateRange.end).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <select
              value={range}
              onChange={(e) => setRange(parseInt(e.target.value))}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-neutral-600 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-neutral-900">
              {formatCurrency(analytics.summary.totalRevenue)}
            </p>
            <p className="text-xs text-neutral-500 mt-2">
              +{formatCurrency(analytics.summary.totalTips)} in tips
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-neutral-600 text-sm mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-neutral-900">{analytics.summary.totalBookings}</p>
            <p className="text-xs text-neutral-500 mt-2">
              Avg: {formatCurrency(analytics.summary.avgBookingValue)}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-neutral-600 text-sm mb-1">Retention Rate</p>
            <p className="text-3xl font-bold text-neutral-900">{analytics.summary.retentionRate}%</p>
            <p className="text-xs text-neutral-500 mt-2">Repeat customers</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-neutral-600 text-sm mb-1">Average Rating</p>
            <p className="text-3xl font-bold text-neutral-900">
              {analytics.summary.avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-neutral-500 mt-2">{analytics.summary.totalReviews} reviews</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Revenue Trend</h2>
          <div className="space-y-2">
            {analytics.revenue.daily.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-xs text-neutral-600 w-24">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="flex-1 bg-neutral-100 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full flex items-center px-3 text-white text-xs font-medium rounded-full transition-all"
                    style={{ width: `${(day.amount / maxRevenue) * 100}%` }}
                  >
                    {day.amount > 0 && formatCurrency(day.amount)}
                  </div>
                </div>
                <span className="text-xs text-neutral-500 w-16">
                  {day.bookings} {day.bookings === 1 ? 'booking' : 'bookings'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Service & Staff Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Service Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Top Services</h2>
            <div className="space-y-4">
              {analytics.services.slice(0, 5).map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{service.serviceName}</p>
                    <p className="text-sm text-neutral-500">{service.bookings} bookings</p>
                  </div>
                  <p className="text-lg font-bold text-primary-600">
                    {formatCurrency(service.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Staff Performance</h2>
            <div className="space-y-4">
              {analytics.staff.slice(0, 5).map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{member.staffName}</p>
                    <p className="text-sm text-neutral-500">
                      {member.bookings} bookings · {formatCurrency(member.tips)} tips
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary-600">
                    {formatCurrency(member.totalEarnings)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak Hours & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Peak Hours */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Peak Hours</h2>
            <div className="space-y-3">
              {analytics.peakHours.map((hour, index) => {
                const maxBookings = Math.max(...analytics.peakHours.map((h) => h.bookings));
                return (
                  <div key={index} className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-900 w-16">{hour.hour}</span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full flex items-center px-2 text-white text-xs font-medium rounded-full"
                        style={{ width: `${(hour.bookings / maxBookings) * 100}%` }}
                      >
                        {hour.bookings}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Appointment Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Appointment Status</h2>
            <div className="space-y-3">
              {analytics.status.map((stat, index) => {
                const totalCount = analytics.status.reduce((sum, s) => sum + s.count, 0);
                const percentage = (stat.count / totalCount) * 100;
                const statusColors: { [key: string]: string } = {
                  COMPLETED: 'bg-green-500',
                  CONFIRMED: 'bg-blue-500',
                  SCHEDULED: 'bg-purple-500',
                  CANCELLED: 'bg-red-500',
                  PENDING: 'bg-yellow-500',
                };

                return (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-neutral-900 w-24">{stat.status}</span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-6 overflow-hidden">
                      <div
                        className={`${statusColors[stat.status] || 'bg-neutral-500'} h-full flex items-center px-2 text-white text-xs font-medium rounded-full`}
                        style={{ width: `${percentage}%` }}
                      >
                        {stat.count}
                      </div>
                    </div>
                    <span className="text-xs text-neutral-500 w-12">{percentage.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>

            {/* Cancellation Rate Warning */}
            {analytics.summary.cancellationRate > 15 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">High Cancellation Rate</p>
                  <p className="text-xs text-red-700 mt-1">
                    Your cancellation rate is {analytics.summary.cancellationRate}%. Consider implementing
                    stricter cancellation policies or deposit requirements.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
