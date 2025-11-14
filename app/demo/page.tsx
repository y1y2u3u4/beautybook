import Link from 'next/link';
import { User, Briefcase, Sparkles, Calendar, BarChart3, Heart, Clock } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-primary-600">BeautyBook</h1>
            </Link>
            <div className="flex gap-4">
              <Link href="/sign-in" className="btn-secondary">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Interactive Demo - No Sign Up Required
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Experience BeautyBook
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Explore our platform with pre-loaded demo data. Choose your role below to see how BeautyBook works for customers and service providers.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Customer Demo */}
          <Link href="/demo/customer" className="group">
            <div className="card-glass p-8 h-full hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary-500/50 transition-shadow">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Customer View</h2>
                  <p className="text-neutral-600">Browse as a client</p>
                </div>
              </div>

              <p className="text-neutral-700 mb-6">
                Explore the customer experience: browse providers, book appointments, manage bookings, and track your loyalty rewards.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-neutral-700">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span>View and manage appointments</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-700">
                  <Heart className="w-5 h-5 text-primary-600" />
                  <span>Favorite providers and services</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-700">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <span>Earn loyalty points & rewards</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-700">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span>Join waitlists for busy times</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600">Demo as:</span>
                  <span className="text-sm font-semibold text-primary-600">Demo User</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-neutral-600">Membership:</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-neutral-400 to-neutral-500 text-white text-xs font-bold rounded-full">
                    SILVER
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-neutral-600">Loyalty Points:</span>
                  <span className="text-sm font-semibold text-secondary-600">1,250 pts</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="btn-primary w-full text-center group-hover:shadow-lg transition-shadow">
                  Start Customer Demo →
                </div>
              </div>
            </div>
          </Link>

          {/* Provider Demo */}
          <Link href="/demo/provider" className="group">
            <div className="card-glass p-8 h-full hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-secondary-500/50 transition-shadow">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Provider View</h2>
                  <p className="text-neutral-600">Browse as a business owner</p>
                </div>
              </div>

              <p className="text-neutral-700 mb-6">
                Experience the provider dashboard: manage appointments, view analytics, track revenue, and optimize your business operations.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-neutral-700">
                  <Calendar className="w-5 h-5 text-secondary-600" />
                  <span>Manage appointments & schedule</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-700">
                  <BarChart3 className="w-5 h-5 text-secondary-600" />
                  <span>View detailed analytics dashboard</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-700">
                  <User className="w-5 h-5 text-secondary-600" />
                  <span>Manage staff & locations</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-700">
                  <Sparkles className="w-5 h-5 text-secondary-600" />
                  <span>Track revenue & performance</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600">Demo as:</span>
                  <span className="text-sm font-semibold text-secondary-600">Radiant Beauty Spa</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-neutral-600">Rating:</span>
                  <span className="text-sm font-semibold text-accent-600">4.8 ⭐ (127 reviews)</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-neutral-600">Monthly Revenue:</span>
                  <span className="text-sm font-semibold text-green-600">$2,340</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="btn-primary w-full text-center group-hover:shadow-lg transition-shadow bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800">
                  Start Provider Demo →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-8">
            What You'll Experience
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Smart Booking</h3>
              <p className="text-neutral-600 text-sm">
                Seamless appointment scheduling with real-time availability, automatic reminders, and calendar sync
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Analytics Dashboard</h3>
              <p className="text-neutral-600 text-sm">
                Comprehensive business insights with revenue tracking, service performance, and customer retention metrics
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Loyalty Rewards</h3>
              <p className="text-neutral-600 text-sm">
                Multi-tier loyalty program with automatic points, exclusive rewards, and referral bonuses
              </p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-12 text-center">
          <p className="text-neutral-600">
            💡 <strong>Note:</strong> This is a fully interactive demo with pre-loaded data.
            No actions will affect real data.
            <Link href="/sign-up" className="text-primary-600 hover:text-primary-700 font-medium ml-1">
              Sign up for a real account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
