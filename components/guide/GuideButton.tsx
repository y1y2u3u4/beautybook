'use client';

import { useState } from 'react';
import { HelpCircle, Book, Play, MessageCircle, X, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useUserGuide } from '@/hooks/useUserGuide';

interface GuideButtonProps {
  position?: 'bottom-right' | 'bottom-left';
  userRole?: 'customer' | 'provider';
  onOpenGuide?: () => void;
  onStartTour?: () => void;
}

export default function GuideButton({
  position = 'bottom-right',
  userRole = 'customer',
  onOpenGuide,
  onStartTour
}: GuideButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { startTour, hasCompletedTour, resetGuide } = useUserGuide();

  const positionClasses = position === 'bottom-right'
    ? 'right-6 bottom-6'
    : 'left-6 bottom-6';

  const handleStartTour = () => {
    startTour();
    onStartTour?.();
    setIsOpen(false);
  };

  const handleOpenGuide = () => {
    onOpenGuide?.();
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: <Play className="w-4 h-4" />,
      label: hasCompletedTour ? 'Restart Interactive Tour' : 'Start Interactive Tour',
      description: 'Learn by doing with step-by-step guidance',
      onClick: handleStartTour,
      color: 'text-primary-600'
    },
    {
      icon: <Book className="w-4 h-4" />,
      label: 'View Full Guide',
      description: 'Complete documentation and tips',
      href: '/guide',
      color: 'text-secondary-600'
    },
    {
      icon: <MessageCircle className="w-4 h-4" />,
      label: 'Quick Help',
      description: 'Common questions and answers',
      onClick: handleOpenGuide,
      color: 'text-accent-600'
    }
  ];

  return (
    <div className={`fixed ${positionClasses} z-[90]`}>
      {/* Menu popup */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden animate-slide-up mb-2">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold">Need Help?</h3>
            </div>
            <p className="text-sm text-white/80 mt-1">
              We&apos;re here to help you get the most out of BeautyBook
            </p>
          </div>

          <div className="p-2">
            {menuItems.map((item, index) => (
              item.href ? (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className={`w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">{item.label}</div>
                    <div className="text-xs text-neutral-500">{item.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-neutral-900">{item.label}</div>
                    <div className="text-xs text-neutral-500">{item.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              )
            ))}
          </div>

          {hasCompletedTour && (
            <div className="border-t border-neutral-100 p-2">
              <button
                onClick={() => {
                  resetGuide();
                  setIsOpen(false);
                }}
                className="w-full text-sm text-neutral-500 hover:text-neutral-700 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Reset all guide progress
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? 'bg-neutral-700 hover:bg-neutral-800'
            : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-glow'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <HelpCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Pulse animation for first-time users */}
      {!hasCompletedTour && !isOpen && (
        <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-30 pointer-events-none" />
      )}
    </div>
  );
}
