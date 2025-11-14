'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Heart, Gift, User, LogOut, Sparkles, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { DEMO_CUSTOMER, DEMO_APPOINTMENTS, DEMO_LOYALTY_TRANSACTIONS } from '@/lib/demo-user';

type Tab = 'appointments' | 'favorites' | 'loyalty' | 'profile';

export default function CustomerDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('appointments');
  const [appointments] = useState(DEMO_APPOINTMENTS);
  const [loyaltyTransactions] = useState(DEMO_LOYALTY_TRANSACTIONS);

  const upcomingAppointments = appointments.filter(apt =>
    apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
  );
  const pastAppointments = appointments.filter(apt =>
    apt.status === 'COMPLETED'
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'from-amber-700 to-amber-800';
      case 'SILVER': return 'from-neutral-400 to-neutral-500';
      case 'GOLD': return 'from-yellow-400 to-yellow-500';
      case 'DIAMOND': return 'from-cyan-400 to-blue-500';
      default: return 'from-neutral-400 to-neutral-500';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
              <div className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                Demo Mode
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
        {/* User Profile Card */}
        <div className="card-glass p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {DEMO_CUSTOMER.firstName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  {DEMO_CUSTOMER.firstName} {DEMO_CUSTOMER.lastName}
                </h2>
                <p className="text-neutral-600">{DEMO_CUSTOMER.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-block px-4 py-2 bg-gradient-to-r ${getTierColor(DEMO_CUSTOMER.customerProfile.membershipTier)} text-white font-bold rounded-full mb-2`}>
                {DEMO_CUSTOMER.customerProfile.membershipTier}
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Gift className="w-5 h-5 text-secondary-600" />
                <span className="text-2xl font-bold text-secondary-600">
                  {DEMO_CUSTOMER.customerProfile.loyaltyPoints}
                </span>
                <span className="text-neutral-600">points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-8">
          <nav className="flex border-b border-neutral-200">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'appointments'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Calendar className="w-5 h-5 inline-block mr-2" />
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Heart className="w-5 h-5 inline-block mr-2" />
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('loyalty')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'loyalty'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Gift className="w-5 h-5 inline-block mr-2" />
              Rewards
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <User className="w-5 h-5 inline-block mr-2" />
              Profile
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'appointments' && (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Upcoming Appointments</h3>
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="card-glass p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {apt.status}
                          </div>
                          <span className="text-neutral-600">{formatDate(apt.date)}</span>
                        </div>
                        <h4 className="text-lg font-bold text-neutral-900 mb-2">{apt.service.name}</h4>
                        <p className="text-neutral-600 mb-4">{apt.service.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-neutral-700">
                            <Clock className="w-4 h-4 text-primary-600" />
                            <span>{apt.startTime} - {apt.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-700">
                            <MapPin className="w-4 h-4 text-primary-600" />
                            <span>{apt.provider.businessName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-neutral-900 mb-2">
                          ${apt.amount.toFixed(2)}
                        </div>
                        <div className="space-y-2">
                          <button className="btn-secondary text-sm w-full">Reschedule</button>
                          <button className="btn-secondary text-sm w-full text-red-600">Cancel</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Appointments */}
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Past Appointments</h3>
              <div className="space-y-4">
                {pastAppointments.map((apt) => (
                  <div key={apt.id} className="card-glass p-6 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-bold">
                            COMPLETED
                          </div>
                          <span className="text-neutral-600">{formatDate(apt.date)}</span>
                        </div>
                        <h4 className="text-lg font-bold text-neutral-900 mb-2">{apt.service.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-neutral-700">
                          <Clock className="w-4 h-4" />
                          <span>{apt.startTime} - {apt.endTime}</span>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-neutral-900 font-bold mb-1">
                          ${apt.amount.toFixed(2)}
                        </div>
                        {apt.tipAmount > 0 && (
                          <div className="text-sm text-neutral-600">
                            + ${apt.tipAmount.toFixed(2)} tip
                          </div>
                        )}
                        <button className="btn-primary text-sm mt-2">Leave Review</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Favorites Yet</h3>
            <p className="text-neutral-600 mb-6">Start adding providers and services to your favorites</p>
            <Link href="/demo/providers" className="btn-primary inline-block">
              Browse Providers
            </Link>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-6">
            {/* Loyalty Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card-glass p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Gift className="w-6 h-6 text-secondary-600" />
                  <h3 className="font-semibold text-neutral-900">Total Points</h3>
                </div>
                <div className="text-3xl font-bold text-secondary-600">
                  {DEMO_CUSTOMER.customerProfile.loyaltyPoints}
                </div>
              </div>
              <div className="card-glass p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                  <h3 className="font-semibold text-neutral-900">Membership</h3>
                </div>
                <div className={`inline-block px-4 py-2 bg-gradient-to-r ${getTierColor(DEMO_CUSTOMER.customerProfile.membershipTier)} text-white font-bold rounded-full`}>
                  {DEMO_CUSTOMER.customerProfile.membershipTier}
                </div>
              </div>
              <div className="card-glass p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-neutral-900">Total Spent</h3>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  ${DEMO_CUSTOMER.customerProfile.totalSpent.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Transaction History</h3>
              <div className="space-y-3">
                {loyaltyTransactions.map((transaction) => (
                  <div key={transaction.id} className="card-glass p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-neutral-900 mb-1">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${
                      transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="card-glass p-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>
                <input
                  type="text"
                  value={`${DEMO_CUSTOMER.firstName} ${DEMO_CUSTOMER.lastName}`}
                  disabled
                  className="input w-full bg-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                <input
                  type="email"
                  value={DEMO_CUSTOMER.email}
                  disabled
                  className="input w-full bg-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={DEMO_CUSTOMER.customerProfile.phone}
                  disabled
                  className="input w-full bg-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
                <input
                  type="text"
                  value={`${DEMO_CUSTOMER.customerProfile.city}, ${DEMO_CUSTOMER.customerProfile.state} ${DEMO_CUSTOMER.customerProfile.zipCode}`}
                  disabled
                  className="input w-full bg-neutral-100"
                />
              </div>
              <div className="pt-4">
                <button disabled className="btn-primary opacity-50 cursor-not-allowed">
                  Save Changes (Demo Mode)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
