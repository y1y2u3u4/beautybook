'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Briefcase,
  User,
  Scissors,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Play,
  Star,
  Shield,
  Zap,
} from 'lucide-react';

const setupSteps = [
  {
    id: 1,
    icon: User,
    title: 'Complete Your Profile',
    description: 'Add your business info, photo, and bio to attract clients',
    href: '/provider/profile',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    icon: Scissors,
    title: 'Add Your Services',
    description: 'List your services with prices and durations',
    href: '/provider/services',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 3,
    icon: Clock,
    title: 'Set Your Availability',
    description: 'Define your working hours and booking preferences',
    href: '/provider/calendar',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 4,
    icon: Users,
    title: 'Manage Your Team',
    description: 'Add staff members and assign services',
    href: '/provider/staff',
    color: 'from-emerald-500 to-teal-500',
  },
];

const benefits = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Automated booking system that works 24/7',
    stat: '70%',
    statLabel: 'less time on admin',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    description: 'Reach new clients actively searching for services',
    stat: '3x',
    statLabel: 'more visibility',
  },
  {
    icon: DollarSign,
    title: 'Increase Revenue',
    description: 'Reduce no-shows with deposits and reminders',
    stat: '25%',
    statLabel: 'revenue boost',
  },
  {
    icon: Star,
    title: 'Build Reputation',
    description: 'Collect reviews and showcase your best work',
    stat: '4.8',
    statLabel: 'avg provider rating',
  },
];

const quickActions = [
  {
    title: 'Dashboard',
    description: 'View your business overview',
    href: '/provider/dashboard',
    icon: Briefcase,
  },
  {
    title: 'Appointments',
    description: 'Manage upcoming bookings',
    href: '/provider/appointments',
    icon: Calendar,
  },
  {
    title: 'Analytics',
    description: 'Track your performance',
    href: '/provider/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Customers',
    description: 'View your client base',
    href: '/provider/customers',
    icon: Users,
  },
];

export default function ProviderWelcome() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Simulated progress - in production, this would check actual completion
  useEffect(() => {
    const savedProgress = localStorage.getItem('providerOnboardingProgress');
    if (savedProgress) {
      setCompletedSteps(JSON.parse(savedProgress));
    }
  }, []);

  const markStepComplete = (stepId: number) => {
    const newCompleted = [...completedSteps, stepId];
    setCompletedSteps(newCompleted);
    localStorage.setItem('providerOnboardingProgress', JSON.stringify(newCompleted));
  };

  const progressPercentage = (completedSteps.length / setupSteps.length) * 100;

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-violet-500 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold">BeautyBook Pro</span>
            </div>
            <Link
              href="/provider/dashboard"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Skip to Dashboard →
            </Link>
          </div>

          {/* Welcome Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-6">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-white/90">Welcome to the Pro Dashboard</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Grow Your Beauty
                <br />
                <span className="bg-gradient-to-r from-primary-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                  Business Today
                </span>
              </h1>

              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Join thousands of beauty professionals who use BeautyBook to
                manage appointments, grow their client base, and increase revenue.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/provider/profile"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  Start Setup
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/provider/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  View Dashboard
                </Link>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Setup Progress</h3>
                <span className="text-sm text-white/70">{completedSteps.length}/{setupSteps.length} complete</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-8">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 via-violet-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {setupSteps.map((step) => {
                  const Icon = step.icon;
                  const isComplete = completedSteps.includes(step.id);
                  const isHovered = hoveredStep === step.id;

                  return (
                    <Link
                      key={step.id}
                      href={step.href}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                        isComplete
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      onMouseEnter={() => setHoveredStep(step.id)}
                      onMouseLeave={() => setHoveredStep(null)}
                      onClick={() => !isComplete && markStepComplete(step.id)}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${step.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-slate-400">{step.description}</p>
                      </div>
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ChevronRight className={`w-5 h-5 text-white/50 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Professionals Choose BeautyBook
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Everything you need to run and grow your beauty business in one place
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-50 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-slate-600 group-hover:text-primary-600 transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{benefit.stat}</div>
                  <div className="text-sm text-primary-600 font-medium mb-3">{benefit.statLabel}</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Quick Actions
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Jump right into managing your business
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-violet-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-primary-500/30 group-hover:to-violet-500/30 transition-all">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    {action.title}
                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-slate-400">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-6">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Trusted by 10,000+ Beauty Professionals
            </h3>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Join the community of successful beauty professionals who have transformed
              their business with BeautyBook.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">$2M+</div>
                <div className="text-sm text-slate-500">Revenue Generated</div>
              </div>
              <div className="w-px h-12 bg-slate-300 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">50K+</div>
                <div className="text-sm text-slate-500">Appointments Booked</div>
              </div>
              <div className="w-px h-12 bg-slate-300 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">4.9/5</div>
                <div className="text-sm text-slate-500">Provider Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 bg-gradient-to-br from-primary-600 to-violet-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Complete your profile setup and start accepting bookings today.
          </p>
          <Link
            href="/provider/profile"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            Complete Setup
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
