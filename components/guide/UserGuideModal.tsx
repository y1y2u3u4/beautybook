'use client';

import { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  Calendar,
  Star,
  Users,
  BarChart3,
  Sparkles,
  MapPin,
  Clock,
  Settings,
  CheckCircle2,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { useUserGuide } from '@/hooks/useUserGuide';

interface GuideSlide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  color: 'primary' | 'secondary' | 'accent';
  forRole?: 'customer' | 'provider' | 'all';
}

const customerSlides: GuideSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to BeautyBook',
    description: 'Your one-stop platform for discovering and booking top-rated beauty professionals. Let us show you how to get the most out of your experience.',
    icon: <Sparkles className="w-16 h-16" />,
    tips: [
      'Browse thousands of verified beauty professionals',
      'Read authentic reviews from real customers',
      'Book appointments instantly, 24/7'
    ],
    color: 'primary',
    forRole: 'all'
  },
  {
    id: 'search',
    title: 'Find Your Perfect Match',
    description: 'Use our powerful search and filter system to find exactly what you\'re looking for.',
    icon: <Search className="w-16 h-16" />,
    tips: [
      'Search by service type (e.g., "Facial", "Hair Styling")',
      'Filter by location, rating, and price range',
      'View real-time availability'
    ],
    color: 'secondary',
    forRole: 'customer'
  },
  {
    id: 'providers',
    title: 'Explore Provider Profiles',
    description: 'Get to know your beauty professionals before booking.',
    icon: <Users className="w-16 h-16" />,
    tips: [
      'View credentials, certifications, and experience',
      'Browse portfolio and before/after photos',
      'Read verified customer reviews'
    ],
    color: 'primary',
    forRole: 'customer'
  },
  {
    id: 'booking',
    title: 'Book in 3 Easy Steps',
    description: 'Our streamlined booking process makes scheduling appointments effortless.',
    icon: <Calendar className="w-16 h-16" />,
    tips: [
      'Step 1: Select your desired service',
      'Step 2: Choose a convenient date',
      'Step 3: Pick an available time slot'
    ],
    color: 'accent',
    forRole: 'customer'
  },
  {
    id: 'reviews',
    title: 'Share Your Experience',
    description: 'Help others make informed decisions by sharing your experience.',
    icon: <Star className="w-16 h-16" />,
    tips: [
      'Rate your service after each appointment',
      'Write detailed reviews to help others',
      'Mark helpful reviews from other customers'
    ],
    color: 'secondary',
    forRole: 'customer'
  }
];

const providerSlides: GuideSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to BeautyBook Provider',
    description: 'Manage your beauty business efficiently with our comprehensive dashboard. Let us guide you through the key features.',
    icon: <Sparkles className="w-16 h-16" />,
    tips: [
      'Streamline your appointment management',
      'Grow your client base with online visibility',
      'Track your business performance'
    ],
    color: 'primary',
    forRole: 'all'
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard Overview',
    description: 'Get a quick snapshot of your business performance at a glance.',
    icon: <BarChart3 className="w-16 h-16" />,
    tips: [
      'View daily/weekly/monthly appointment stats',
      'Track revenue and customer metrics',
      'See upcoming appointments and reviews'
    ],
    color: 'secondary',
    forRole: 'provider'
  },
  {
    id: 'appointments',
    title: 'Manage Appointments',
    description: 'Handle all your appointments efficiently with our smart management tools.',
    icon: <Calendar className="w-16 h-16" />,
    tips: [
      'View all appointments in one place',
      'Use Smart Assignment for staff scheduling',
      'Track appointment status and history'
    ],
    color: 'primary',
    forRole: 'provider'
  },
  {
    id: 'services',
    title: 'Service Management',
    description: 'Create and manage your service offerings with ease.',
    icon: <Settings className="w-16 h-16" />,
    tips: [
      'Add new services with pricing and duration',
      'Organize services by category',
      'Set service availability and capacity'
    ],
    color: 'accent',
    forRole: 'provider'
  },
  {
    id: 'staff',
    title: 'Team Management',
    description: 'Build and manage your team of beauty professionals.',
    icon: <Users className="w-16 h-16" />,
    tips: [
      'Add team members with roles and permissions',
      'Track commission and performance',
      'Assign staff to specific services'
    ],
    color: 'secondary',
    forRole: 'provider'
  },
  {
    id: 'calendar',
    title: 'Calendar Sync',
    description: 'Keep your schedule synchronized across all platforms.',
    icon: <Clock className="w-16 h-16" />,
    tips: [
      'Connect with Google Calendar',
      'Automatic conflict prevention',
      'Two-way sync for all appointments'
    ],
    color: 'primary',
    forRole: 'provider'
  }
];

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'customer' | 'provider';
}

export default function UserGuideModal({ isOpen, onClose, userRole = 'customer' }: UserGuideModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { markWelcomeSeen, startTour } = useUserGuide();

  const slides = userRole === 'provider' ? providerSlides : customerSlides;
  const currentSlideData = slides[currentSlide];

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    markWelcomeSeen();
    onClose();
  };

  const handleStartTour = () => {
    markWelcomeSeen();
    startTour();
    onClose();
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'from-primary-500 to-primary-600',
          icon: 'text-primary-500',
          badge: 'bg-primary-100 text-primary-700 border-primary-200'
        };
      case 'secondary':
        return {
          bg: 'from-secondary-500 to-secondary-600',
          icon: 'text-secondary-500',
          badge: 'bg-secondary-100 text-secondary-700 border-secondary-200'
        };
      case 'accent':
        return {
          bg: 'from-accent-500 to-accent-600',
          icon: 'text-accent-500',
          badge: 'bg-accent-100 text-accent-700 border-accent-200'
        };
      default:
        return {
          bg: 'from-primary-500 to-secondary-500',
          icon: 'text-primary-500',
          badge: 'bg-primary-100 text-primary-700 border-primary-200'
        };
    }
  };

  if (!isOpen) return null;

  const colors = getColorClasses(currentSlideData.color);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleComplete}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fade-in">
        {/* Close button */}
        <button
          onClick={handleComplete}
          aria-label="Close guide modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${colors.bg} p-8 text-white relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4 animate-float">
              {currentSlideData.icon}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {currentSlideData.title}
            </h2>
            <p className="text-white/90 text-lg max-w-md">
              {currentSlideData.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Tips */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500 mb-4">
              <Lightbulb className="w-4 h-4" />
              <span>Quick Tips</span>
            </div>
            {currentSlideData.tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <CheckCircle2 className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                <span className="text-neutral-700">{tip}</span>
              </div>
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? `bg-gradient-to-r ${colors.bg} w-8`
                    : 'bg-neutral-300 hover:bg-neutral-400'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                currentSlide === 0
                  ? 'text-neutral-300 cursor-not-allowed'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <button
              onClick={handleStartTour}
              className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Rocket className="w-4 h-4" />
              Start Interactive Tour
            </button>

            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all bg-gradient-to-r ${colors.bg} text-white hover:shadow-lg hover:scale-105`}
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle2 className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
