'use client';

import { useTestUser } from '@/hooks/useTestUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Calendar, Users, DollarSign, Star, Clock, TrendingUp } from 'lucide-react';

export default function ProviderDashboard() {
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

  const stats = [
    {
      label: 'Total Appointments',
      value: '24',
      change: '+12%',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Customers',
      value: '156',
      change: '+8%',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Revenue This Month',
      value: '$4,280',
      change: '+23%',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      label: 'Average Rating',
      value: '4.9',
      change: '+0.2',
      icon: Star,
      color: 'bg-yellow-500',
    },
  ];

  const upcomingAppointments = [
    {
      id: '1',
      customerName: 'Jessica Smith',
      service: 'Hydrating Facial',
      date: 'Today',
      time: '2:00 PM',
      status: 'confirmed',
    },
    {
      id: '2',
      customerName: 'Michael Brown',
      service: 'Anti-Aging Treatment',
      date: 'Today',
      time: '4:30 PM',
      status: 'confirmed',
    },
    {
      id: '3',
      customerName: 'Emma Wilson',
      service: 'Chemical Peel',
      date: 'Tomorrow',
      time: '10:00 AM',
      status: 'pending',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Welcome back, {testUser.firstName}!
              </h1>
              <p className="text-neutral-600 mt-1">
                Here&apos;s what&apos;s happening with your business today
              </p>
            </div>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
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
          {stats.map((stat) => (
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

          <div className="divide-y divide-neutral-200">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="px-6 py-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {appointment.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">
                        {appointment.customerName}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {appointment.service}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-neutral-900">
                      {appointment.date} • {appointment.time}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          appointment.status === 'confirmed'
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
        </div>

        {/* Test Mode Notice */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧪</div>
            <div>
              <div className="font-bold text-yellow-900 mb-1">
                Test Mode - Provider Dashboard
              </div>
              <p className="text-yellow-800 text-sm">
                This is demo data for testing purposes. In a real environment, this would show your actual appointments,
                customers, and analytics. Connect to a database to see real data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
