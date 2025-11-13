'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Calendar, Heart, User, Star, Sparkles, Share2, Users, ClipboardList, Briefcase } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Check if Clerk is available
  const hasClerk = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">BeautyBook</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/providers" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
                Find Providers
              </Link>
              {hasClerk ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Link href="/sign-in" className="btn-primary">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1">
            <nav className="card space-y-6">
              {/* Customer Section */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 mb-2">
                  个人
                </p>
                <div className="space-y-1">
                  <Link
                    href="/dashboard/appointments"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">My Appointments</span>
                  </Link>
                  <Link
                    href="/dashboard/favorites"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Favorites</span>
                  </Link>
                  <Link
                    href="/dashboard/reviews"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Star className="w-5 h-5" />
                    <span className="font-medium">My Reviews</span>
                  </Link>
                </div>
              </div>

              {/* Provider Section */}
              <div className="pt-4 border-t border-neutral-200">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 mb-2">
                  商户功能
                </p>
                <div className="space-y-1">
                  <Link
                    href="/dashboard/manage-appointments"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <ClipboardList className="w-5 h-5" />
                    <span className="font-medium">Manage Appointments</span>
                  </Link>
                  <Link
                    href="/dashboard/staff"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Staff Management</span>
                  </Link>
                  <Link
                    href="/dashboard/services"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="font-medium">Service Management</span>
                  </Link>
                  <Link
                    href="/dashboard/sharing"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Sharing Center</span>
                  </Link>
                </div>
              </div>

              {/* Account Section */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="space-y-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
