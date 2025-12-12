'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Sparkles,
  Search,
  Calendar,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
  MapPin,
  Clock,
  Gift,
  ChevronRight,
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover',
    description: 'Find the perfect beauty professional near you',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: Calendar,
    title: 'Book',
    description: 'Schedule your appointment in seconds',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Sparkles,
    title: 'Glow',
    description: 'Enjoy your beauty transformation',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
];

const features = [
  {
    icon: MapPin,
    title: 'Local Experts',
    description: 'Connect with top-rated professionals in your area',
  },
  {
    icon: Clock,
    title: 'Instant Booking',
    description: 'Book appointments 24/7, no phone calls needed',
  },
  {
    icon: Star,
    title: 'Verified Reviews',
    description: 'Read authentic reviews from real customers',
  },
  {
    icon: Gift,
    title: 'Exclusive Offers',
    description: 'Access special deals and loyalty rewards',
  },
];

export default function CustomerWelcome() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-100 shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Welcome to BeautyBook</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Your Beauty Journey
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
              Discover amazing beauty professionals, book appointments effortlessly,
              and transform your look with confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/search"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Find Your Pro
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/customer/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-neutral-700 font-semibold rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Animated Steps */}
          <div className="relative max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index;
                return (
                  <div
                    key={step.title}
                    className={`relative p-6 rounded-3xl transition-all duration-500 cursor-pointer ${
                      isActive
                        ? 'bg-white shadow-2xl shadow-neutral-200/50 scale-105'
                        : 'bg-white/60 hover:bg-white hover:shadow-lg'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    {/* Step Number */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-neutral-800 to-neutral-900 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className={`w-14 h-14 ${step.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${step.iconColor}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{step.title}</h3>
                    <p className="text-neutral-600">{step.description}</p>

                    {/* Progress Bar */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-100 rounded-b-3xl overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${step.color} animate-progress`}></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Why You&apos;ll Love BeautyBook
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              We&apos;ve designed every feature with your beauty needs in mind
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 bg-neutral-50 rounded-2xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-pink-50 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-16 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Here are some quick actions to help you explore
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Browse Providers',
                description: 'Explore beauty professionals near you',
                href: '/search',
                icon: Search,
                gradient: 'from-violet-600 to-purple-600',
              },
              {
                title: 'My Appointments',
                description: 'View and manage your bookings',
                href: '/customer/appointments',
                icon: Calendar,
                gradient: 'from-blue-600 to-cyan-600',
              },
              {
                title: 'My Favorites',
                description: 'Access your saved providers',
                href: '/customer/favorites',
                icon: Heart,
                gradient: 'from-pink-600 to-rose-600',
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    {action.title}
                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-pink-500 rounded-2xl mb-6 shadow-lg shadow-primary-500/25">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
            You&apos;re All Set!
          </h2>
          <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
            Your account is ready. Start exploring our amazing beauty professionals
            and book your first appointment today.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <Search className="w-5 h-5" />
            Start Exploring
          </Link>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 3s linear;
        }
      `}</style>
    </div>
  );
}
