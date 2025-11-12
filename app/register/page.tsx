'use client';

import Link from 'next/link';
import { UserCircle, Briefcase, ArrowRight, Sparkles, Check } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">BeautyBook</h1>
            </Link>
            <Link href="/" className="text-neutral-600 hover:text-neutral-900 font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Join <span className="gradient-text">BeautyBook</span>
          </h1>
          <p className="text-xl text-neutral-600">
            Choose your account type to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Customer Registration */}
          <div className="card-glass group hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mb-6 shadow-glow group-hover:shadow-glow-lg transition-shadow mx-auto">
                <UserCircle className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 mb-3 text-center">
                I&apos;m a Customer
              </h2>
              <p className="text-neutral-600 mb-6 text-center">
                Book appointments with verified beauty professionals
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Browse thousands of verified providers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Read authentic reviews from real customers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Book appointments 24/7 with instant confirmation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Manage all your bookings in one place</span>
                </li>
              </ul>

              <Link
                href="/sign-up"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Sign Up as Customer
                <ArrowRight className="w-5 h-5" />
              </Link>

              <p className="text-center text-sm text-neutral-500 mt-4">
                Already have an account? <Link href="/sign-in" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
              </p>
            </div>
          </div>

          {/* Provider Registration */}
          <div className="card-glass group hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-primary-200">
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                POPULAR
              </span>
            </div>

            <div className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-3xl flex items-center justify-center mb-6 shadow-glow group-hover:shadow-glow-lg transition-shadow mx-auto">
                <Briefcase className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 mb-3 text-center">
                I&apos;m a Provider
              </h2>
              <p className="text-neutral-600 mb-6 text-center">
                Grow your business with new clients
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Reach thousands of potential clients</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Manage bookings and schedule efficiently</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Build your professional reputation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Accept payments securely online</span>
                </li>
              </ul>

              <Link
                href="/sign-up?role=provider"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-secondary-500 to-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Sign Up as Provider
                <ArrowRight className="w-5 h-5" />
              </Link>

              <p className="text-center text-sm text-neutral-500 mt-4">
                Already have an account? <Link href="/sign-in" className="text-secondary-600 hover:text-secondary-700 font-medium">Sign in</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <p className="text-neutral-600 mb-8">
            Trusted by thousands of beauty professionals and clients
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">10,000+</div>
              <div className="text-neutral-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">5,000+</div>
              <div className="text-neutral-600">Verified Providers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">50,000+</div>
              <div className="text-neutral-600">Bookings Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
