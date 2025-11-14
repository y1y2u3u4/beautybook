'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  // Check if we have a valid Clerk key (not placeholder)
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidKey = publishableKey && !publishableKey.includes('placeholder');

  // If no valid key (e.g., during build), just render children without Clerk
  if (!hasValidKey) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
