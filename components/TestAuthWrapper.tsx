'use client';

import { ReactNode } from 'react';
import { SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut } from '@clerk/nextjs';
import { useTestAuth } from '@/hooks/useTestAuth';

interface AuthWrapperProps {
  children: ReactNode;
}

// Custom SignedIn that also works in test mode
export function TestSignedIn({ children }: AuthWrapperProps) {
  const { isSignedIn, isTestMode, isLoaded } = useTestAuth();

  if (!isLoaded) {
    return null;
  }

  // In test mode, show children if "signed in"
  if (isTestMode && isSignedIn) {
    return <>{children}</>;
  }

  // Otherwise use Clerk's SignedIn
  return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

// Custom SignedOut that also works in test mode
export function TestSignedOut({ children }: AuthWrapperProps) {
  const { isSignedIn, isTestMode, isLoaded } = useTestAuth();

  if (!isLoaded) {
    return null;
  }

  // In test mode, show children only if not "signed in"
  if (isTestMode) {
    return isSignedIn ? null : <>{children}</>;
  }

  // Otherwise use Clerk's SignedOut
  return <ClerkSignedOut>{children}</ClerkSignedOut>;
}
