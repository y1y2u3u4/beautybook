'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Users, DollarSign, Star, Clock, TrendingUp, Loader2, AlertCircle, Sparkles, ArrowRight, X } from 'lucide-react';
import { useAuth, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

interface DashboardStats {
  totalAppointments: number;
  totalCustomers: number;
  monthlyRevenue: number;
  averageRating: number;
  appointmentsChange: string;
  customersChange: string;
  revenueChange: string;
  ratingChange: string;
}

interface Appointment {
  id: string;
  status: string;
  startTime: string;
  customer?: {
    firstName?: string;
    lastName?: string;
  };
  service?: {
    name: string;
  };
}

export default function ProviderDashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  useEffect(() => {
    // Check if this is a new user (first visit)
    const hasSeenWelcome = localStorage.getItem('providerHasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeBanner(true);
    }
  }, []);

  const dismissWelcomeBanner = () => {
    localStorage.setItem('providerHasSeenWelcome', 'true');
    setShowWelcomeBanner(false);
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchDashboardData();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics overview and appointments in parallel
      const [analyticsRes, appointmentsRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/appointments?role=provider'),
      ]);

      // Handle analytics
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setStats({
          totalAppointments: analyticsData.totalAppointments || 0,
          totalCustomers: analyticsData.totalCustomers || 0,
          monthlyRevenue: analyticsData.revenue?.thisMonth || 0,
          averageRating: analyticsData.rating?.average || 0,
          appointmentsChange: analyticsData.appointmentsChange || '+0%',
          customersChange: analyticsData.customersChange || '+0%',
          revenueChange: analyticsData.revenueChange || '+0%',
          ratingChange: analyticsData.ratingChange || '+0.0',
        });
        setDataSource(analyticsData.source || 'unknown');
      } else {
        // Use mock stats if analytics fails
        setStats({
          totalAppointments: 24,
          totalCustomers: 156,
          monthlyRevenue: 4280,
          averageRating: 4.9,
          appointmentsChange: '+12%',
          customersChange: '+8%',
          revenueChange: '+23%',
          ratingChange: '+0.2',
        });
        setDataSource('mock');
      }

      // Handle appointments
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        // Filter and sort upcoming appointments
        const now = new Date();
        const upcomingAppts = (appointmentsData.appointments || [])
          .filter((apt: Appointment) => {
            const aptDate = new Date(apt.startTime);
            return aptDate >= now && !['CANCELLED', 'cancelled', 'COMPLETED', 'completed'].includes(apt.status);
          })
          .slice(0, 5);
        setAppointments(upcomingAppts);
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message);
      // Set mock data on error
      setStats({
        totalAppointments: 24,
        totalCustomers: 156,
        monthlyRevenue: 4280,
        averageRating: 4.9,
        appointmentsChange: '+12%',
        customersChange: '+8%',
        revenueChange: '+23%',
        ratingChange: '+0.2',
      });
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-neutral-600">Loading dashboard...</span>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Appointments',
      value: stats?.totalAppointments.toString() || '0',
      change: stats?.appointmentsChange || '+0%',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Customers',
      value: stats?.totalCustomers.toString() || '0',
      change: stats?.customersChange || '+0%',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Revenue This Month',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      change: stats?.revenueChange || '+0%',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      label: 'Average Rating',
      value: stats?.averageRating.toFixed(1) || '0.0',
      change: stats?.ratingChange || '+0.0',
      icon: Star,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">BeautyBook</h1>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/provider/dashboard" className="text-primary-600 font-medium">
                Dashboard
              </Link>
              <Link href="/provider/appointments" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Appointments
              </Link>
              <Link href="/provider/services" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Services
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in" className="btn-primary px-6 py-2">
                  Sign In
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-neutral-600 mt-1">
            Here&apos;s what&apos;s happening with your business today
          </p>
        </div>

        {/* Welcome Banner */}
        {showWelcomeBanner && (
          <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            {/* Gradient Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl"></div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-violet-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome to BeautyBook Pro{user?.firstName ? `, ${user.firstName}` : ''}!
                  </h2>
                  <p className="text-slate-300 max-w-lg">
                    Complete your setup to start accepting bookings and grow your beauty business.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <Link
                  href="/provider/welcome"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={dismissWelcomeBanner}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Source Badge */}
        {dataSource === 'mock' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-yellow-600">&#x26A0;</span>
            <div>
              <p className="font-semibold text-yellow-800">Demo Mode</p>
              <p className="text-sm text-yellow-700">
                Showing sample data. Database connection unavailable.
              </p>
            </div>
          </div>
        )}

        {/* Sign In Required */}
        <SignedOut>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="text-neutral-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Sign in to access your dashboard
            </h3>
            <p className="text-neutral-600 mb-6">
              Please sign in to view your business analytics and manage appointments.
            </p>
            <Link
              href="/sign-in"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Error loading dashboard</p>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-2 text-sm text-red-800 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Link
              href="/provider/appointments"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Manage</div>
                  <div className="font-semibold text-neutral-900">Appointments</div>
                </div>
              </div>
            </Link>

            <Link
              href="/provider/calendar-sync"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Sync</div>
                  <div className="font-semibold text-neutral-900">Google Calendar</div>
                </div>
              </div>
            </Link>

            <Link
              href="/provider/services"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Manage</div>
                  <div className="font-semibold text-neutral-900">Services</div>
                </div>
              </div>
            </Link>

            <Link
              href="/provider/customers"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-neutral-600">View</div>
                  <div className="font-semibold text-neutral-900">Customers</div>
                </div>
              </div>
            </Link>

            <Link
              href="/provider/staff"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Manage</div>
                  <div className="font-semibold text-neutral-900">Staff</div>
                </div>
              </div>
            </Link>

            <Link
              href="/provider/analytics"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-neutral-600">View</div>
                  <div className="font-semibold text-neutral-900">Analytics</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">
                Upcoming Appointments
              </h2>
              <Link
                href="/provider/appointments"
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
              >
                View All →
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No upcoming appointments</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="px-6 py-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {appointment.customer?.firstName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">
                            {appointment.customer?.firstName} {appointment.customer?.lastName}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {appointment.service?.name || 'Service'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-neutral-900">
                          {formatDate(appointment.startTime)} • {formatTime(appointment.startTime)}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              appointment.status.toLowerCase() === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
