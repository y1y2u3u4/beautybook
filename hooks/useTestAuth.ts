'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'PROVIDER';
  imageUrl: string;
  isTestMode: boolean;
}

export function useTestAuth() {
  const { isSignedIn: clerkSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const [testUser, setTestUser] = useState<TestUser | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check for test mode in localStorage and cookies
    const testModeStorage = localStorage.getItem('testMode');
    const testUserStorage = localStorage.getItem('testUser');

    if (testModeStorage === 'true' && testUserStorage) {
      try {
        const parsedUser = JSON.parse(testUserStorage) as TestUser;
        setTestUser(parsedUser);
        setIsTestMode(true);
      } catch (e) {
        console.error('Failed to parse test user:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Determine effective signed-in state
  const isSignedIn = isTestMode ? true : clerkSignedIn;

  // Determine effective user
  const user = isTestMode
    ? {
        id: testUser?.id || '',
        firstName: testUser?.firstName || '',
        lastName: testUser?.lastName || '',
        imageUrl: testUser?.imageUrl || '',
        emailAddresses: [{ emailAddress: testUser?.email || '' }],
      }
    : clerkUser;

  // Combined loaded state
  const loaded = isTestMode ? isLoaded : (clerkLoaded && isLoaded);

  return {
    isSignedIn,
    isLoaded: loaded,
    isTestMode,
    user,
    testUser,
    // Helper to check role
    isProvider: isTestMode ? testUser?.role === 'PROVIDER' : true, // Assume provider if Clerk signed in on provider pages
    isCustomer: isTestMode ? testUser?.role === 'CUSTOMER' : true,
  };
}
