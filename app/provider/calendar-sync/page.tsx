'use client';

import { useTestUser } from '@/hooks/useTestUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, RefreshCw, CheckCircle, AlertCircle, ExternalLink, Settings } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  customer?: string;
  synced: boolean;
  source: 'google' | 'local';
}

export default function ProviderCalendarSync() {
  const { testUser, isTestMode, isLoading } = useTestUser();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isTestMode || testUser?.role !== 'PROVIDER')) {
      router.push('/test-mode');
    }
  }, [isLoading, isTestMode, testUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!testUser || testUser.role !== 'PROVIDER') {
    return null;
  }

  const handleConnect = () => {
    // In real implementation, this would redirect to Google OAuth
    setIsConnected(true);
    setLastSyncTime(new Date());
  };

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setLastSyncTime(null);
  };

  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Hydrating Facial - Jessica Smith',
      start: '2024-01-20T14:00:00',
      end: '2024-01-20T15:00:00',
      customer: 'Jessica Smith',
      synced: true,
      source: 'local',
    },
    {
      id: '2',
      title: 'Team Meeting',
      start: '2024-01-20T10:00:00',
      end: '2024-01-20T11:00:00',
      synced: true,
      source: 'google',
    },
    {
      id: '3',
      title: 'Anti-Aging Treatment - Michael Brown',
      start: '2024-01-20T16:30:00',
      end: '2024-01-20T18:00:00',
      customer: 'Michael Brown',
      synced: true,
      source: 'local',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Google Calendar Sync
              </h1>
              <p className="text-neutral-600 mt-1">
                Sync your appointments with Google Calendar
              </p>
            </div>
            <Link
              href="/provider/dashboard"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isConnected ? 'bg-green-100' : 'bg-neutral-100'
              }`}>
                <Calendar className={`w-6 h-6 ${
                  isConnected ? 'text-green-600' : 'text-neutral-400'
                }`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  Google Calendar
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {isConnected ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-semibold">Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-600">Not connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isConnected ? (
                <>
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 bg-neutral-200 text-neutral-700 px-6 py-2 rounded-lg font-semibold hover:bg-neutral-300 transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnect}
                  className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Connect Google Calendar
                </button>
              )}
            </div>
          </div>

          {lastSyncTime && (
            <div className="text-sm text-neutral-600">
              Last synced: {lastSyncTime.toLocaleString()}
            </div>
          )}
        </div>

        {/* Sync Settings */}
        {isConnected && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-neutral-600" />
              <h3 className="text-lg font-bold text-neutral-900">Sync Settings</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                />
                <div>
                  <div className="font-semibold text-neutral-900">
                    Auto-sync appointments to Google Calendar
                  </div>
                  <div className="text-sm text-neutral-600">
                    Automatically create events when new appointments are booked
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                />
                <div>
                  <div className="font-semibold text-neutral-900">
                    Import personal events from Google Calendar
                  </div>
                  <div className="text-sm text-neutral-600">
                    Show your personal calendar events to prevent double booking
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                />
                <div>
                  <div className="font-semibold text-neutral-900">
                    Send calendar invites to customers
                  </div>
                  <div className="text-sm text-neutral-600">
                    Automatically send Google Calendar invites to customers
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                />
                <div>
                  <div className="font-semibold text-neutral-900">
                    Two-way sync (Beta)
                  </div>
                  <div className="text-sm text-neutral-600">
                    Changes in Google Calendar will update BeautyBook appointments
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Calendar Events */}
        {isConnected && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900">
                Synced Events
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                Events from both BeautyBook and Google Calendar
              </p>
            </div>

            <div className="divide-y divide-neutral-200">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="px-6 py-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        event.source === 'google'
                          ? 'bg-blue-100'
                          : 'bg-primary-100'
                      }`}>
                        {event.source === 'google' ? (
                          <ExternalLink className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Calendar className="w-5 h-5 text-primary-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-neutral-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-neutral-600 mt-1">
                          {new Date(event.start).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(event.end).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          event.source === 'google'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-primary-100 text-primary-700'
                        }`}>
                          {event.source === 'google' ? 'Google' : 'BeautyBook'}
                        </span>
                        {event.synced && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Guide */}
        {!isConnected && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">
              How to Connect Google Calendar
            </h3>
            <ol className="space-y-3 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Click &quot;Connect Google Calendar&quot; button above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Sign in with your Google account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Grant BeautyBook permission to access your calendar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Configure your sync settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">5.</span>
                <span>Your appointments will automatically sync!</span>
              </li>
            </ol>
          </div>
        )}

        {/* Test Mode Notice */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧪</div>
            <div>
              <div className="font-bold text-yellow-900 mb-1">
                Test Mode - Google Calendar Integration
              </div>
              <p className="text-yellow-800 text-sm mb-3">
                This is a demo of the Google Calendar sync feature. In production, you&apos;ll need to:
              </p>
              <ul className="space-y-2 text-yellow-800 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Set up Google OAuth credentials in the Google Cloud Console</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Configure environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Enable Google Calendar API for your project</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Connect to database to store sync tokens and settings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
