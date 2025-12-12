'use client';

import { useAuth, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Heart,
  Search,
  Star,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle,
  User,
  ChevronRight,
} from 'lucide-react';

interface Appointment {
  id: string;
  status: string;
  startTime: string;
  provider?: {
    businessName: string;
    city?: string;
    state?: string;
  };
  service?: {
    name: string;
    price: number;
  };
}

export default function CustomerDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Check if this is a new user (first visit)
    const hasSeenWelcome = localStorage.getItem('customerHasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeBanner(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [appointmentsRes, favoritesRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/favorites'),
        ]);

        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json();
          const now = new Date();
          const upcomingAppts = (data.appointments || [])
            .filter((apt: Appointment) => {
              const aptDate = new Date(apt.startTime);
              return aptDate >= now && !['CANCELLED', 'cancelled'].includes(apt.status);
            })
            .slice(0, 3);
          setAppointments(upcomingAppts);
        }

        if (favoritesRes.ok) {
          const data = await favoritesRes.json();
          setFavoritesCount(data.favorites?.length || 0);
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchData();
    }
  }, [isSignedIn]);

  const dismissWelcomeBanner = () => {
    localStorage.setItem('customerHasSeenWelcome', 'true');
    setShowWelcomeBanner(false);
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
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary-600">BeautyBook</h1>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/customer/dashboard" className="text-primary-600 font-medium">
                Dashboard
              </Link>
              <Link href="/search" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Find Pros
              </Link>
              <Link href="/customer/appointments" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Appointments
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  Sign In
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SignedOut>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <User className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Sign in to access your dashboard
            </h3>
            <p className="text-neutral-600 mb-6">
              View your appointments, favorites, and more.
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
          {/* Welcome Banner */}
          {showWelcomeBanner && (
            <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-violet-600 to-pink-600 p-8 text-white">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Welcome to BeautyBook{user?.firstName ? `, ${user.firstName}` : ''}!
                    </h2>
                    <p className="text-white/80 max-w-md">
                      Discover amazing beauty professionals and book your first appointment in minutes.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href="/customer/welcome"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-white/90 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={dismissWelcomeBanner}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">
              {user?.firstName ? `Hi, ${user.firstName}!` : 'Your Dashboard'}
            </h1>
            <p className="text-neutral-600 mt-1">
              Manage your appointments and discover new beauty pros
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              href="/search"
              className="group bg-white rounded-2xl p-6 border border-neutral-200 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                Find Professionals
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-sm text-neutral-600">Browse beauty experts near you</p>
            </Link>

            <Link
              href="/customer/appointments"
              className="group bg-white rounded-2xl p-6 border border-neutral-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                My Appointments
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-sm text-neutral-600">View and manage bookings</p>
            </Link>

            <Link
              href="/customer/favorites"
              className="group bg-white rounded-2xl p-6 border border-neutral-200 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                My Favorites
                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                  {favoritesCount}
                </span>
              </h3>
              <p className="text-sm text-neutral-600">Your saved professionals</p>
            </Link>

            <Link
              href="/customer/profile"
              className="group bg-white rounded-2xl p-6 border border-neutral-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                My Profile
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-sm text-neutral-600">Update your information</p>
            </Link>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Upcoming Appointments</h2>
              <Link
                href="/customer/appointments"
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
              >
                View All →
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-semibold text-neutral-900 mb-2">No upcoming appointments</h3>
                <p className="text-neutral-500 mb-6">Ready to book your next beauty session?</p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Find Professionals
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="px-6 py-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold">
                          {appointment.provider?.businessName?.charAt(0) || 'B'}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">
                            {appointment.provider?.businessName || 'Beauty Provider'}
                          </div>
                          <div className="text-sm text-neutral-600 flex items-center gap-2">
                            <span>{appointment.service?.name || 'Service'}</span>
                            {appointment.provider?.city && (
                              <>
                                <span className="text-neutral-300">•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {appointment.provider.city}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-neutral-900">
                          {formatDate(appointment.startTime)}
                        </div>
                        <div className="text-sm text-neutral-600 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(appointment.startTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Getting Started Tips (shown when no appointments) */}
          {appointments.length === 0 && !showWelcomeBanner && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                Getting Started
              </h3>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: 'Browse Professionals',
                    description: 'Search by service, location, or specialty',
                    icon: Search,
                  },
                  {
                    step: 2,
                    title: 'Choose Your Pro',
                    description: 'Read reviews and check availability',
                    icon: Star,
                  },
                  {
                    step: 3,
                    title: 'Book & Enjoy',
                    description: 'Secure your appointment instantly',
                    icon: CheckCircle,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-neutral-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SignedIn>
      </div>
    </div>
  );
}
