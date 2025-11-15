'use client';

import { useState, useEffect } from 'react';

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  imageUrl?: string;
  isTestMode: boolean;
}

export function useTestUser() {
  const [testUser, setTestUser] = useState<TestUser | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    // Check if we're in test mode
    const testModeEnabled = localStorage.getItem('testMode') === 'true';
    const storedUser = localStorage.getItem('testUser');

    if (testModeEnabled && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setTestUser(user);
        setIsTestMode(true);
      } catch (error) {
        console.error('Failed to parse test user:', error);
        localStorage.removeItem('testUser');
        localStorage.removeItem('testMode');
      }
    }
  }, []);

  const loginTestUser = (user: TestUser) => {
    localStorage.setItem('testUser', JSON.stringify(user));
    localStorage.setItem('testMode', 'true');
    setTestUser(user);
    setIsTestMode(true);
  };

  const logoutTestUser = () => {
    localStorage.removeItem('testUser');
    localStorage.removeItem('testMode');
    setTestUser(null);
    setIsTestMode(false);
  };

  return {
    testUser,
    isTestMode,
    loginTestUser,
    logoutTestUser,
  };
}
