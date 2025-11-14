'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Calendar,
  Users,
  Settings,
  LogOut,
  Sparkles,
  TrendingUp,
  DollarSign,
  Star,
  UserCheck,
  Download,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { DEMO_PROVIDER, DEMO_ANALYTICS } from '@/lib/demo-user';

type Tab = 'analytics' | 'appointments' | 'staff' | 'services' | 'locations';

export default function ProviderDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [timeRange, setTimeRange] = useState(30);

  const analytics = DEMO_ANALYTICS;
  const maxRevenue = Math.max(...analytics.revenue.daily.map((d) => d.amount));
  const maxBookings = Math.max(...analytics.peakHours.map((h) => h.bookings));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/demo" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-primary-600">BeautyBook</h1>
            </Link>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm font-medium rounded-full">
                Provider Demo
              </div>
              <Link href="/demo" className="btn-secondary flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Exit Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Profile Card */}
        <div className="card-glass p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-200">
                {DEMO_PROVIDER.imageUrl && (
                  <img
                    src={DEMO_PROVIDER.imageUrl}
                    alt={DEMO_PROVIDER.providerProfile.businessName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  {DEMO_PROVIDER.providerProfile.businessName}
                </h2>
                <p className="text-neutral-600">{DEMO_PROVIDER.providerProfile.title}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{DEMO_PROVIDER.providerProfile.averageRating}</span>
                    <span className="text-neutral-600 text-sm">
                      ({DEMO_PROVIDER.providerProfile.reviewCount} reviews)
                    </span>
                  </div>
                  {DEMO_PROVIDER.providerProfile.verified && (
                    <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                      VERIFIED
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {formatCurrency(analytics.revenue.thisMonth)}
              </div>
              <div className="text-sm text-neutral-600">This Month</div>
              <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                <TrendingUp className="w-4 h-4" />
                <span>+{analytics.revenue.change.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-8">
          <nav className="flex border-b border-neutral-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'text-secondary-600 border-b-2 border-secondary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline-block mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-4 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'text-secondary-600 border-b-2 border-secondary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Calendar className="w-5 h-5 inline-block mr-2" />
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-6 py-4 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'staff'
                  ? 'text-secondary-600 border-b-2 border-secondary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Users className="w-5 h-5 inline-block mr-2" />
              Staff
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-4 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'services'
                  ? 'text-secondary-600 border-b-2 border-secondary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Briefcase className="w-5 h-5 inline-block mr-2" />
              Services
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-6 py-4 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'locations'
                  ? 'text-secondary-600 border-b-2 border-secondary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <MapPin className="w-5 h-5 inline-block mr-2" />
              Locations
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-glass p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-600">Revenue</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {formatCurrency(analytics.revenue.thisMonth)}
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{analytics.revenue.change.toFixed(1)}% from last month</span>
                </div>
              </div>

              <div className="card-glass p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-600">Bookings</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {analytics.bookings.thisMonth}
                </div>
                <div className="flex items-center gap-1 text-blue-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{analytics.bookings.change.toFixed(1)}% from last month</span>
                </div>
              </div>

              <div className="card-glass p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-600">Retention</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {analytics.retention.rate.toFixed(1)}%
                </div>
                <div className="text-sm text-neutral-600">
                  {analytics.retention.returningCustomers} returning customers
                </div>
              </div>

              <div className="card-glass p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-600">Rating</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {analytics.rating.average} ⭐
                </div>
                <div className="text-sm text-neutral-600">
                  {analytics.rating.total} total reviews
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900">Revenue Trend</h3>
                <button className="btn-secondary text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              <div className="space-y-3">
                {analytics.revenue.daily.map((day, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-neutral-600">{day.date}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-neutral-600">{day.count} bookings</span>
                        <span className="font-semibold text-neutral-900">{formatCurrency(day.amount)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                        style={{ width: `${(day.amount / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Services */}
              <div className="card-glass p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-6">Top Services</h3>
                <div className="space-y-4">
                  {analytics.services.top.map((service, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary-600">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-neutral-900 truncate">{service.name}</div>
                        <div className="text-sm text-neutral-600">
                          {service.bookings} bookings · {service.averageRating} ⭐
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neutral-900">{formatCurrency(service.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Performance */}
              <div className="card-glass p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-6">Staff Performance</h3>
                <div className="space-y-4">
                  {analytics.staff.map((member, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-neutral-900 truncate">{member.name}</div>
                        <div className="text-sm text-neutral-600">
                          {member.bookings} bookings · {member.rating} ⭐
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neutral-900">{formatCurrency(member.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Peak Hours */}
            <div className="card-glass p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">Peak Hours</h3>
              <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
                {analytics.peakHours.map((slot, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="bg-gradient-to-t from-primary-500 to-primary-300 rounded-lg mb-2 transition-all hover:shadow-lg"
                      style={{ height: `${(slot.bookings / maxBookings) * 120 + 20}px` }}
                    />
                    <div className="text-xs font-semibold text-neutral-900">{slot.hour}</div>
                    <div className="text-xs text-neutral-600">{slot.bookings}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Appointments Management</h3>
            <p className="text-neutral-600 mb-6">View and manage your upcoming and past appointments</p>
            <div className="text-sm text-neutral-500">
              This feature would show a calendar view with all appointments
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="card-glass p-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Staff Management</h3>
            <div className="space-y-4">
              {analytics.staff.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">{member.name}</div>
                      <div className="text-sm text-neutral-600">
                        {member.bookings} bookings this month · {member.rating} ⭐
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(member.revenue)}</div>
                    <div className="text-sm text-neutral-600">revenue</div>
                  </div>
                </div>
              ))}
              <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
                Add Staff Member (Demo Mode)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="card-glass p-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Services</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {analytics.services.top.map((service, index) => (
                <div key={index} className="p-4 border border-neutral-200 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{service.name}</h4>
                      <div className="text-sm text-neutral-600">{service.bookings} bookings</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-neutral-900">{formatCurrency(service.revenue)}</div>
                      <div className="text-sm text-neutral-600">{service.averageRating} ⭐</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button disabled className="btn-secondary text-sm flex-1 opacity-50">Edit</button>
                    <button disabled className="btn-secondary text-sm flex-1 opacity-50">View</button>
                  </div>
                </div>
              ))}
            </div>
            <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
              Add New Service (Demo Mode)
            </button>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="card-glass p-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Business Locations</h3>
            <div className="space-y-4 mb-6">
              <div className="p-6 border-2 border-primary-200 bg-primary-50 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-neutral-900">Main Office</h4>
                      <span className="px-2 py-1 bg-primary-600 text-white text-xs font-bold rounded">PRIMARY</span>
                    </div>
                    <div className="space-y-1 text-sm text-neutral-700">
                      <div>{DEMO_PROVIDER.providerProfile.address}</div>
                      <div>
                        {DEMO_PROVIDER.providerProfile.city}, {DEMO_PROVIDER.providerProfile.state}{' '}
                        {DEMO_PROVIDER.providerProfile.zipCode}
                      </div>
                      <div>{DEMO_PROVIDER.providerProfile.phone}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button disabled className="btn-secondary text-sm opacity-50">Edit</button>
                  </div>
                </div>
              </div>
              <div className="p-6 border border-neutral-200 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 mb-2">Downtown Branch</h4>
                    <div className="space-y-1 text-sm text-neutral-700">
                      <div>456 Downtown Ave</div>
                      <div>Los Angeles, CA 90002</div>
                      <div>+1234567891</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button disabled className="btn-secondary text-sm opacity-50">Edit</button>
                    <button disabled className="btn-secondary text-sm opacity-50 text-red-600">Remove</button>
                  </div>
                </div>
              </div>
            </div>
            <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
              Add New Location (Demo Mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
