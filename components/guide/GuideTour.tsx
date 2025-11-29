'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Target, Sparkles } from 'lucide-react';
import { useUserGuide } from '@/hooks/useUserGuide';

interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
}

interface GuideTourProps {
  steps: TourStep[];
  onComplete?: () => void;
}

export default function GuideTour({ steps, onComplete }: GuideTourProps) {
  const { tourActive, currentStep, nextStep, prevStep, endTour, completeTour } = useUserGuide();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStepData = steps[currentStep];

  const updatePosition = useCallback(() => {
    if (!currentStepData || !tourActive) return;

    if (currentStepData.targetSelector && currentStepData.position !== 'center') {
      const element = document.querySelector(currentStepData.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        // Calculate tooltip position based on step position
        const padding = currentStepData.highlightPadding || 12;
        const tooltipWidth = 360;
        const tooltipHeight = 200;

        let top = 0;
        let left = 0;

        switch (currentStepData.position || 'bottom') {
          case 'top':
            top = rect.top - tooltipHeight - padding - 10;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'bottom':
            top = rect.bottom + padding + 10;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.left - tooltipWidth - padding - 10;
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.right + padding + 10;
            break;
        }

        // Ensure tooltip stays within viewport
        left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));
        top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));

        setTooltipPosition({ top, left });

        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // Center position
      setTargetRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 180
      });
    }
  }, [currentStepData, tourActive]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      nextStep();
    } else {
      completeTour();
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      prevStep();
    }
  };

  const handleSkip = () => {
    endTour();
  };

  if (!tourActive || !currentStepData) return null;

  const padding = currentStepData.highlightPadding || 12;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Overlay with spotlight */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Target highlight ring */}
      {targetRect && (
        <div
          role="presentation"
          aria-hidden="true"
          className="absolute border-2 border-primary-400 rounded-xl pointer-events-none animate-pulse"
          style={{
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            boxShadow: '0 0 0 4px rgba(236, 72, 153, 0.3), 0 0 20px rgba(236, 72, 153, 0.4)'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={`absolute bg-white rounded-2xl shadow-2xl w-[360px] pointer-events-auto transition-all duration-300 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        {/* Arrow indicator */}
        {targetRect && currentStepData.position === 'bottom' && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-neutral-200" />
        )}
        {targetRect && currentStepData.position === 'top' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-neutral-200" />
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-5 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium opacity-80">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              aria-label="Close tour"
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-lg font-bold mt-2">{currentStepData.title}</h3>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-neutral-600 leading-relaxed mb-4">
            {currentStepData.content}
          </p>

          {/* Progress bar */}
          <div className="flex gap-1 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index <= currentStep
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                    : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentStep === 0
                  ? 'text-neutral-300 cursor-not-allowed'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleSkip}
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              Skip tour
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-defined tour configurations
export const customerTourSteps: TourStep[] = [
  {
    id: 'search-bar',
    title: 'Search for Services',
    content: 'Use the search bar to find beauty services by type (like "Facial" or "Hair Styling") and your location. Start typing to see suggestions!',
    targetSelector: '.search-input',
    position: 'bottom'
  },
  {
    id: 'filters',
    title: 'Filter Your Results',
    content: 'Narrow down your search using filters like specialty, rating, distance, and price range to find the perfect match for your needs.',
    targetSelector: '.filter-sidebar',
    position: 'right'
  },
  {
    id: 'provider-card',
    title: 'Browse Providers',
    content: 'Each card shows key information about a provider - their rating, specialties, location, and next available slot. Click to view their full profile!',
    targetSelector: '.provider-card',
    position: 'right'
  },
  {
    id: 'book-button',
    title: 'Book Your Appointment',
    content: 'Found someone you like? Click the booking button to schedule your appointment in just a few clicks.',
    targetSelector: '.book-button',
    position: 'left'
  }
];

export const providerTourSteps: TourStep[] = [
  {
    id: 'dashboard-stats',
    title: 'Your Dashboard Overview',
    content: 'Here you can see your key metrics at a glance - today\'s appointments, total customers, revenue, and your average rating.',
    targetSelector: '.dashboard-stats',
    position: 'bottom'
  },
  {
    id: 'appointments-nav',
    title: 'Manage Appointments',
    content: 'Click here to view and manage all your appointments. You can filter by status, assign staff, and track appointment history.',
    targetSelector: '[href*="/provider/appointments"]',
    position: 'right'
  },
  {
    id: 'services-nav',
    title: 'Your Services',
    content: 'Add and manage your service offerings here. Set prices, durations, and descriptions for each service you provide.',
    targetSelector: '[href*="/provider/services"]',
    position: 'right'
  },
  {
    id: 'staff-nav',
    title: 'Team Management',
    content: 'Build your team by adding staff members. Assign roles, set commissions, and manage their schedules.',
    targetSelector: '[href*="/provider/staff"]',
    position: 'right'
  },
  {
    id: 'smart-assignment',
    title: 'Smart Assignment',
    content: 'Use the Smart Assignment feature to automatically assign staff to appointments based on skills, availability, or workload balance.',
    targetSelector: '.smart-assignment-btn',
    position: 'bottom'
  }
];
