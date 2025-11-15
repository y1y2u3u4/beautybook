'use client';

import { useTestUser } from '@/hooks/useTestUser';
import Link from 'next/link';

export default function TestModeIndicator() {
  const { testUser, isTestMode, logoutTestUser } = useTestUser();

  if (!isTestMode || !testUser) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-400 border-2 border-yellow-600 rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              🧪
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-neutral-900 text-sm">
                Test Mode Active
              </div>
              <button
                onClick={logoutTestUser}
                className="text-neutral-700 hover:text-neutral-900"
                title="Exit test mode"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-xs text-neutral-800 mb-2">
              <div className="font-semibold">
                {testUser.firstName} {testUser.lastName}
              </div>
              <div className="opacity-75">{testUser.email}</div>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 bg-yellow-600 text-white rounded text-[10px] font-semibold">
                  {testUser.role}
                </span>
              </div>
            </div>

            <Link
              href="/test-mode"
              className="text-xs text-neutral-900 hover:text-neutral-700 font-semibold underline"
            >
              Switch Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
