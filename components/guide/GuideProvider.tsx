'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useUserGuide } from '@/hooks/useUserGuide';
import { useTestUser } from '@/hooks/useTestUser';
import UserGuideModal from './UserGuideModal';
import GuideTour, { customerTourSteps, providerTourSteps } from './GuideTour';
import GuideButton from './GuideButton';

interface GuideContextType {
  showWelcome: () => void;
  startTour: () => void;
}

const GuideContext = createContext<GuideContextType>({
  showWelcome: () => {},
  startTour: () => {}
});

export const useGuide = () => useContext(GuideContext);

interface GuideProviderProps {
  children: ReactNode;
}

export default function GuideProvider({ children }: GuideProviderProps) {
  const pathname = usePathname();
  const { testUser, isTestMode } = useTestUser();
  const {
    hasSeenWelcome,
    tourActive,
    isLoading,
    startTour: startUserGuideTour
  } = useUserGuide();

  const [showModal, setShowModal] = useState(false);
  const [showGuideButton, setShowGuideButton] = useState(false);

  // Determine user role based on current path and test user
  const isProviderArea = pathname?.startsWith('/provider');
  const userRole = isProviderArea ? 'provider' : 'customer';

  // Show welcome modal for first-time users
  useEffect(() => {
    if (!isLoading && !hasSeenWelcome && !showModal) {
      // Delay showing the modal slightly for better UX
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasSeenWelcome, showModal]);

  // Show guide button on relevant pages
  useEffect(() => {
    const relevantPaths = [
      '/providers',
      '/provider/dashboard',
      '/provider/appointments',
      '/provider/services',
      '/provider/staff',
      '/provider/customers',
      '/provider/analytics',
      '/customer/appointments'
    ];

    const shouldShow = relevantPaths.some(path => pathname?.startsWith(path));
    setShowGuideButton(shouldShow);
  }, [pathname]);

  // Don't render on guide page itself
  if (pathname === '/guide') {
    return <>{children}</>;
  }

  const contextValue: GuideContextType = {
    showWelcome: () => setShowModal(true),
    startTour: startUserGuideTour
  };

  const tourSteps = userRole === 'provider' ? providerTourSteps : customerTourSteps;

  return (
    <GuideContext.Provider value={contextValue}>
      {children}

      {/* Welcome Modal */}
      <UserGuideModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userRole={userRole}
      />

      {/* Interactive Tour */}
      {tourActive && (
        <GuideTour
          steps={tourSteps}
          onComplete={() => {
            // Optional callback when tour completes
          }}
        />
      )}

      {/* Floating Help Button */}
      {showGuideButton && (
        <GuideButton
          userRole={userRole}
          onOpenGuide={() => setShowModal(true)}
          onStartTour={startUserGuideTour}
        />
      )}
    </GuideContext.Provider>
  );
}
