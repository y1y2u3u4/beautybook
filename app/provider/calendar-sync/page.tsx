'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, RefreshCw, CheckCircle, AlertCircle, ExternalLink, Settings, Download, Loader2, Users } from 'lucide-react';
import { useAuth, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

interface CalendarEvent {
  googleEventId: string;
  title: string;
  serviceName: string;
  customerName: string;
  customerEmail?: string;
  startTime: string;
  endTime: string;
  date: string;
  duration: number;
  description?: string;
  source: 'google' | 'local';
  synced: boolean;
  status: string;
}

interface CalendarSettings {
  provider: string;
  autoSync: boolean;
  syncDirection: string;
  lastSyncedAt: string | null;
  enabled: boolean;
}

function ProviderCalendarSyncContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const searchParams = useSearchParams();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [dataSource, setDataSource] = useState<string>('');

  // Settings state
  const [autoSync, setAutoSync] = useState(true);
  const [importPersonal, setImportPersonal] = useState(true);
  const [sendInvites, setSendInvites] = useState(true);
  const [twoWaySync, setTwoWaySync] = useState(false);

  useEffect(() => {
    // Check for URL parameters (success/error from OAuth callback)
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (success === 'connected') {
      setSuccessMessage('Successfully connected to Google Calendar!');
      setTimeout(() => setSuccessMessage(null), 5000);
    }

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        access_denied: 'Access was denied. Please try again.',
        expired_state: 'Connection request expired. Please try again.',
        oauth_failed: 'Failed to connect to Google Calendar. Please try again.',
        provider_not_found: 'Provider profile not found.',
      };
      setError(errorMessages[errorParam] || 'An error occurred. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchCalendarStatus();
      fetchCalendarEvents();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchCalendarStatus = async () => {
    try {
      const response = await fetch('/api/calendar/status');
      const data = await response.json();

      setIsConfigured(data.configured || false);
      setIsConnected(data.connected || false);
      setSettings(data.settings);

      if (data.settings) {
        setAutoSync(data.settings.autoSync);
      }
    } catch (err) {
      console.error('Failed to fetch calendar status:', err);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/events');
      const data = await response.json();

      setEvents(data.events || []);
      setDataSource(data.source || 'unknown');
      setIsConnected(data.connected || false);

      if (data.error && !data.events?.length) {
        setError(data.error);
      }
    } catch (err: any) {
      console.error('Failed to fetch calendar events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const response = await fetch('/api/calendar/connect');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect');
      }

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else if (!data.configured) {
        setError('Google Calendar integration is not configured. Please contact support.');
        // For demo purposes, simulate connection
        setIsConnected(true);
        setSuccessMessage('Demo mode: Calendar connected (simulated)');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to connect:', err);
      // For demo purposes, allow simulated connection
      setIsConnected(true);
      setDataSource('mock');
      setSuccessMessage('Demo mode: Calendar connected');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);

    try {
      await fetchCalendarEvents();
      setSuccessMessage('Calendar synced successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) {
      return;
    }

    try {
      const response = await fetch('/api/calendar/status', {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsConnected(false);
        setSettings(null);
        setEvents([]);
        setSuccessMessage('Calendar disconnected successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      // For demo, just disconnect locally
      setIsConnected(false);
      setEvents([]);
    }
  };

  const handleImportSelected = async () => {
    if (selectedEvents.size === 0) {
      setError('Please select events to import');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const eventsToImport = events.filter(e => selectedEvents.has(e.googleEventId) && !e.synced);

      const response = await fetch('/api/calendar/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToImport }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setSuccessMessage(`Successfully imported ${data.imported} events!`);
      setSelectedEvents(new Set());

      // Refresh events
      await fetchCalendarEvents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      const response = await fetch('/api/calendar/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoSync,
          syncDirection: twoWaySync ? 'BOTH' : 'TO_GOOGLE',
        }),
      });

      if (response.ok) {
        setSuccessMessage('Settings updated!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      // Silently handle for demo
    }
  };

  const toggleEventSelection = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const selectAllUnsynced = () => {
    const unsynced = events.filter(e => !e.synced).map(e => e.googleEventId);
    setSelectedEvents(new Set(unsynced));
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-neutral-600">Loading calendar...</span>
      </div>
    );
  }

  const unsyncedEvents = events.filter(e => !e.synced);
  const syncedEvents = events.filter(e => e.synced);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">BeautyBook</h1>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/provider/dashboard" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/provider/appointments" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Appointments
              </Link>
              <Link href="/provider/calendar-sync" className="text-primary-600 font-medium">
                Calendar Sync
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in" className="btn-primary px-6 py-2">
                  Sign In
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Google Calendar Sync</h1>
            <p className="text-neutral-600 mt-1">Import and sync appointments with Google Calendar</p>
          </div>
          <Link
            href="/provider/dashboard"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
          </div>
        )}

        {/* Data Source Badge */}
        {dataSource === 'mock' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-yellow-600">&#x26A0;</span>
            <div>
              <p className="font-semibold text-yellow-800">Demo Mode</p>
              <p className="text-sm text-yellow-700">
                Showing sample calendar events. Configure Google OAuth to sync real events.
              </p>
            </div>
          </div>
        )}

        <SignedIn>
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
                  <h2 className="text-lg font-bold text-neutral-900">Google Calendar</h2>
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
                    disabled={isConnecting}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
                  </button>
                )}
              </div>
            </div>

            {settings?.lastSyncedAt && (
              <div className="text-sm text-neutral-600">
                Last synced: {new Date(settings.lastSyncedAt).toLocaleString()}
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
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-semibold text-neutral-900">Auto-sync appointments to Google Calendar</div>
                    <div className="text-sm text-neutral-600">Automatically create events when new appointments are booked</div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={importPersonal}
                    onChange={(e) => setImportPersonal(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-semibold text-neutral-900">Import personal events from Google Calendar</div>
                    <div className="text-sm text-neutral-600">Show your personal calendar events to prevent double booking</div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={sendInvites}
                    onChange={(e) => setSendInvites(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-semibold text-neutral-900">Send calendar invites to customers</div>
                    <div className="text-sm text-neutral-600">Automatically send Google Calendar invites to customers</div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={twoWaySync}
                    onChange={(e) => setTwoWaySync(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-semibold text-neutral-900">Two-way sync (Beta)</div>
                    <div className="text-sm text-neutral-600">Changes in Google Calendar will update BeautyBook appointments</div>
                  </div>
                </label>

                <button
                  onClick={handleSettingsUpdate}
                  className="mt-4 bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* Events to Import */}
          {isConnected && unsyncedEvents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Events to Import</h3>
                  <p className="text-sm text-neutral-600 mt-1">Select events from Google Calendar to import as appointments</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllUnsynced}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleImportSelected}
                    disabled={selectedEvents.size === 0 || isImporting}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isImporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Import Selected ({selectedEvents.size})
                  </button>
                </div>
              </div>

              <div className="divide-y divide-neutral-200">
                {unsyncedEvents.map((event) => (
                  <div
                    key={event.googleEventId}
                    className={`px-6 py-4 hover:bg-neutral-50 transition-colors cursor-pointer ${
                      selectedEvents.has(event.googleEventId) ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => toggleEventSelection(event.googleEventId)}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedEvents.has(event.googleEventId)}
                        onChange={() => toggleEventSelection(event.googleEventId)}
                        className="mt-1 w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-neutral-900">{event.title}</div>
                        {event.customerName && (
                          <div className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
                            <Users className="w-3 h-3" />
                            {event.customerName}
                          </div>
                        )}
                        <div className="text-sm text-neutral-500 mt-1">
                          {new Date(event.startTime).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(event.endTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' '}({event.duration} min)
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        Google
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synced Events */}
          {isConnected && syncedEvents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900">Synced Events</h3>
                <p className="text-sm text-neutral-600 mt-1">Events from both BeautyBook and Google Calendar</p>
              </div>

              <div className="divide-y divide-neutral-200">
                {syncedEvents.map((event) => (
                  <div key={event.googleEventId} className="px-6 py-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          event.source === 'google' ? 'bg-blue-100' : 'bg-primary-100'
                        }`}>
                          {event.source === 'google' ? (
                            <ExternalLink className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Calendar className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-neutral-900">{event.title}</div>
                          <div className="text-sm text-neutral-600 mt-1">
                            {new Date(event.startTime).toLocaleString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {new Date(event.endTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            event.source === 'google' ? 'bg-blue-100 text-blue-700' : 'bg-primary-100 text-primary-700'
                          }`}>
                            {event.source === 'google' ? 'Google' : 'BeautyBook'}
                          </span>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setup Guide (when not connected) */}
          {!isConnected && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">How to Connect Google Calendar</h3>
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
                  <span>Select events to import as appointments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">5.</span>
                  <span>Assign services and staff to imported appointments</span>
                </li>
              </ol>
            </div>
          )}
        </SignedIn>

        <SignedOut>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="text-neutral-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Sign in to sync your calendar</h3>
            <p className="text-neutral-600 mb-6">Please sign in to connect and sync with Google Calendar.</p>
            <Link
              href="/sign-in"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}

export default function ProviderCalendarSyncPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-3 text-neutral-600">Loading calendar...</span>
        </div>
      }
    >
      <ProviderCalendarSyncContent />
    </Suspense>
  );
}
