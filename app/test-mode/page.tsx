'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TestAccount {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'PROVIDER';
  description: string;
  clerkId: string;
}

const testAccounts: TestAccount[] = [
  {
    id: '1',
    email: 'customer@test.com',
    name: 'Test Customer',
    role: 'CUSTOMER',
    description: 'Browse and book appointments',
    clerkId: 'test_customer_123',
  },
  {
    id: '2',
    email: 'provider1@test.com',
    name: 'Sarah Johnson',
    role: 'PROVIDER',
    description: 'Radiant Skin Clinic - Dermatologist',
    clerkId: 'test_provider_1',
  },
  {
    id: '3',
    email: 'provider2@test.com',
    name: 'Emily Rodriguez',
    role: 'PROVIDER',
    description: 'Hair Studio - Master Stylist',
    clerkId: 'test_provider_2',
  },
];

export default function TestModePage() {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleSelectAccount = (account: TestAccount) => {
    // Store test user in localStorage
    const testUser = {
      id: account.clerkId,
      email: account.email,
      firstName: account.name.split(' ')[0],
      lastName: account.name.split(' ')[1] || '',
      role: account.role,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.name}`,
      isTestMode: true,
    };

    localStorage.setItem('testUser', JSON.stringify(testUser));
    localStorage.setItem('testMode', 'true');
    setSelectedAccount(account.id);

    // Redirect based on role
    setTimeout(() => {
      if (account.role === 'PROVIDER') {
        router.push('/provider/dashboard');
      } else {
        router.push('/customer/appointments');
      }
    }, 500);
  };

  const exitTestMode = () => {
    localStorage.removeItem('testUser');
    localStorage.removeItem('testMode');
    setSelectedAccount(null);
    router.push('/');
  };

  const currentTestUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('testUser') || 'null')
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-6 py-2 rounded-full text-sm font-semibold mb-4">
            🧪 Development Test Mode
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Select Test Account
          </h1>
          <p className="text-xl text-neutral-600">
            Choose an account to test different user experiences
          </p>
        </div>

        {/* Current Session */}
        {currentTestUser && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700 font-semibold mb-1">
                  Currently logged in as:
                </div>
                <div className="text-lg font-bold text-green-900">
                  {currentTestUser.firstName} {currentTestUser.lastName}
                </div>
                <div className="text-sm text-green-600">
                  {currentTestUser.email} • {currentTestUser.role}
                </div>
              </div>
              <button
                onClick={exitTestMode}
                className="bg-white text-green-700 border-2 border-green-300 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Exit Test Mode
              </button>
            </div>
          </div>
        )}

        {/* Test Accounts */}
        <div className="space-y-4 mb-8">
          {testAccounts.map((account) => (
            <button
              key={account.id}
              onClick={() => handleSelectAccount(account)}
              disabled={selectedAccount === account.id}
              className={`w-full text-left bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                selectedAccount === account.id
                  ? 'ring-4 ring-primary-500 opacity-75'
                  : 'hover:ring-2 hover:ring-primary-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {account.name.charAt(0)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-neutral-900">
                      {account.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        account.role === 'PROVIDER'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {account.role}
                    </span>
                  </div>
                  <p className="text-neutral-600 mb-2">{account.description}</p>
                  <p className="text-sm text-neutral-500 font-mono">
                    {account.email}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {selectedAccount === account.id && (
                <div className="mt-4 flex items-center gap-2 text-primary-600">
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="font-semibold">Logging in...</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            ℹ️ Test Mode Information
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                Test mode uses localStorage for session management (no real authentication)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                Data is stored in the actual database - changes will persist
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                Provider accounts can manage their services and availability
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                Customer account can browse providers and book appointments
              </span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
