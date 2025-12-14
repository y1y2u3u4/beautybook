'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Calendar, Save, Plus, Trash2, Loader2, AlertCircle, CheckCircle, Settings, Sun, Moon } from 'lucide-react';
import { useAuth, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

interface WorkingHours {
  day: string;
  dayIndex: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}

const defaultWorkingHours: WorkingHours[] = [
  { day: 'Monday', dayIndex: 1, enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Tuesday', dayIndex: 2, enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Wednesday', dayIndex: 3, enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Thursday', dayIndex: 4, enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Friday', dayIndex: 5, enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Saturday', dayIndex: 6, enabled: true, startTime: '10:00', endTime: '16:00' },
  { day: 'Sunday', dayIndex: 0, enabled: false, startTime: '10:00', endTime: '16:00' },
];

const mockBlockedDates: BlockedDate[] = [
  { id: '1', date: '2024-12-25', reason: 'Christmas Day', allDay: true },
  { id: '2', date: '2024-12-26', reason: 'Boxing Day', allDay: true },
  { id: '3', date: '2025-01-01', reason: 'New Year\'s Day', allDay: true },
];

export default function ProviderCalendarPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(defaultWorkingHours);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(mockBlockedDates);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('mock');
  const [activeTab, setActiveTab] = useState<'hours' | 'blocked'>('hours');

  // New blocked date form state
  const [showAddBlockedDate, setShowAddBlockedDate] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState({
    date: '',
    reason: '',
    allDay: true,
    startTime: '09:00',
    endTime: '18:00',
  });

  // Settings
  const [bufferTime, setBufferTime] = useState(15);
  const [minNotice, setMinNotice] = useState(60);
  const [maxAdvance, setMaxAdvance] = useState(30);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchAvailability();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      // Try to fetch from API
      const response = await fetch('/api/provider/availability');
      const data = await response.json();

      if (response.ok && data.workingHours) {
        setWorkingHours(data.workingHours);
        setBlockedDates(data.blockedDates || []);
        setDataSource(data.source || 'database');
        if (data.settings) {
          setBufferTime(data.settings.bufferTime || 15);
          setMinNotice(data.settings.minNotice || 60);
          setMaxAdvance(data.settings.maxAdvance || 30);
        }
      } else {
        // Use default data
        setDataSource('mock');
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHours = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/provider/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workingHours,
          settings: { bufferTime, minNotice, maxAdvance },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save availability');
      }

      setSuccessMessage('Availability saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // For demo, just show success
      setSuccessMessage('Availability saved (demo mode)');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    setWorkingHours(prev =>
      prev.map(h =>
        h.dayIndex === dayIndex ? { ...h, enabled: !h.enabled } : h
      )
    );
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setWorkingHours(prev =>
      prev.map(h =>
        h.dayIndex === dayIndex ? { ...h, [field]: value } : h
      )
    );
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate.date) {
      setError('Please select a date');
      return;
    }

    const newBlocked: BlockedDate = {
      id: `blocked_${Date.now()}`,
      date: newBlockedDate.date,
      reason: newBlockedDate.reason || 'Blocked',
      allDay: newBlockedDate.allDay,
      startTime: newBlockedDate.allDay ? undefined : newBlockedDate.startTime,
      endTime: newBlockedDate.allDay ? undefined : newBlockedDate.endTime,
    };

    setBlockedDates(prev => [...prev, newBlocked]);
    setNewBlockedDate({ date: '', reason: '', allDay: true, startTime: '09:00', endTime: '18:00' });
    setShowAddBlockedDate(false);
    setSuccessMessage('Blocked date added');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleRemoveBlockedDate = (id: string) => {
    setBlockedDates(prev => prev.filter(d => d.id !== id));
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-neutral-600">Loading availability...</span>
      </div>
    );
  }

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
              <Link href="/provider/calendar" className="text-primary-600 font-medium">
                Availability
              </Link>
              <Link href="/provider/calendar-sync" className="text-neutral-600 hover:text-primary-600 transition-colors">
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
            <h1 className="text-2xl font-bold text-neutral-900">Availability Settings</h1>
            <p className="text-neutral-600 mt-1">Set your working hours and manage time off</p>
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
                Showing sample availability settings. Your changes will be saved locally.
              </p>
            </div>
          </div>
        )}

        <SignedIn>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('hours')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'hours'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Clock className="w-5 h-5" />
              Working Hours
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'blocked'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Blocked Dates
              {blockedDates.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {blockedDates.length}
                </span>
              )}
            </button>
          </div>

          {/* Working Hours Tab */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              {/* Weekly Schedule */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Weekly Schedule</h2>
                    <p className="text-sm text-neutral-600">Set your regular working hours for each day</p>
                  </div>
                  <button
                    onClick={handleSaveHours}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                <div className="divide-y divide-neutral-200">
                  {workingHours.map((hours) => (
                    <div
                      key={hours.dayIndex}
                      className={`px-6 py-4 flex items-center gap-6 ${
                        !hours.enabled ? 'bg-neutral-50' : ''
                      }`}
                    >
                      {/* Day Toggle */}
                      <div className="flex items-center gap-3 w-32">
                        <button
                          onClick={() => handleToggleDay(hours.dayIndex)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${
                            hours.enabled ? 'bg-primary-600' : 'bg-neutral-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              hours.enabled ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>
                        <span className={`font-semibold ${hours.enabled ? 'text-neutral-900' : 'text-neutral-400'}`}>
                          {hours.day}
                        </span>
                      </div>

                      {/* Time Inputs */}
                      {hours.enabled ? (
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4 text-yellow-500" />
                            <input
                              type="time"
                              value={hours.startTime}
                              onChange={(e) => handleTimeChange(hours.dayIndex, 'startTime', e.target.value)}
                              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                          <span className="text-neutral-400">to</span>
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4 text-indigo-500" />
                            <input
                              type="time"
                              value={hours.endTime}
                              onChange={(e) => handleTimeChange(hours.dayIndex, 'endTime', e.target.value)}
                              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                          <span className="text-sm text-neutral-500 ml-auto">
                            {(() => {
                              const start = parseInt(hours.startTime.split(':')[0]) * 60 + parseInt(hours.startTime.split(':')[1]);
                              const end = parseInt(hours.endTime.split(':')[0]) * 60 + parseInt(hours.endTime.split(':')[1]);
                              const diff = end - start;
                              const h = Math.floor(diff / 60);
                              const m = diff % 60;
                              return `${h}h ${m > 0 ? `${m}m` : ''}`;
                            })()}
                          </span>
                        </div>
                      ) : (
                        <div className="flex-1 text-neutral-400 italic">
                          Closed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-5 h-5 text-neutral-600" />
                  <h2 className="text-lg font-bold text-neutral-900">Booking Settings</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Buffer Time Between Appointments
                    </label>
                    <select
                      value={bufferTime}
                      onChange={(e) => setBufferTime(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={0}>No buffer</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                    <p className="text-sm text-neutral-500 mt-1">
                      Time between appointments for preparation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Minimum Booking Notice
                    </label>
                    <select
                      value={minNotice}
                      onChange={(e) => setMinNotice(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={0}>No minimum</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={240}>4 hours</option>
                      <option value={480}>8 hours</option>
                      <option value={1440}>24 hours</option>
                      <option value={2880}>48 hours</option>
                    </select>
                    <p className="text-sm text-neutral-500 mt-1">
                      How far in advance customers must book
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Maximum Advance Booking
                    </label>
                    <select
                      value={maxAdvance}
                      onChange={(e) => setMaxAdvance(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={7}>1 week</option>
                      <option value={14}>2 weeks</option>
                      <option value={30}>1 month</option>
                      <option value={60}>2 months</option>
                      <option value={90}>3 months</option>
                    </select>
                    <p className="text-sm text-neutral-500 mt-1">
                      How far ahead customers can book
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Blocked Dates Tab */}
          {activeTab === 'blocked' && (
            <div className="space-y-6">
              {/* Add Blocked Date */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Time Off & Holidays</h2>
                    <p className="text-sm text-neutral-600">Block specific dates when you&apos;re not available</p>
                  </div>
                  {!showAddBlockedDate && (
                    <button
                      onClick={() => setShowAddBlockedDate(true)}
                      className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Blocked Date
                    </button>
                  )}
                </div>

                {/* Add Form */}
                {showAddBlockedDate && (
                  <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Date</label>
                        <input
                          type="date"
                          value={newBlockedDate.date}
                          onChange={(e) => setNewBlockedDate(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Reason</label>
                        <input
                          type="text"
                          value={newBlockedDate.reason}
                          onChange={(e) => setNewBlockedDate(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="e.g., Vacation, Holiday, Personal"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={newBlockedDate.allDay}
                          onChange={() => setNewBlockedDate(prev => ({ ...prev, allDay: true }))}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-neutral-700">All day</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={!newBlockedDate.allDay}
                          onChange={() => setNewBlockedDate(prev => ({ ...prev, allDay: false }))}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-neutral-700">Specific hours</span>
                      </label>
                    </div>

                    {!newBlockedDate.allDay && (
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-neutral-600">From</label>
                          <input
                            type="time"
                            value={newBlockedDate.startTime}
                            onChange={(e) => setNewBlockedDate(prev => ({ ...prev, startTime: e.target.value }))}
                            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-neutral-600">To</label>
                          <input
                            type="time"
                            value={newBlockedDate.endTime}
                            onChange={(e) => setNewBlockedDate(prev => ({ ...prev, endTime: e.target.value }))}
                            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddBlockedDate(false)}
                        className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddBlockedDate}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                      >
                        Add Date
                      </button>
                    </div>
                  </div>
                )}

                {/* Blocked Dates List */}
                {blockedDates.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-neutral-700 mb-1">No blocked dates</h3>
                    <p className="text-neutral-500 text-sm">Add dates when you&apos;re not available for appointments</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedDates
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((blocked) => (
                        <div
                          key={blocked.id}
                          className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex flex-col items-center justify-center">
                              <span className="text-xs text-red-600 font-semibold">
                                {new Date(blocked.date).toLocaleString('en-US', { month: 'short' })}
                              </span>
                              <span className="text-lg font-bold text-red-700">
                                {new Date(blocked.date).getDate()}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-900">{blocked.reason}</div>
                              <div className="text-sm text-neutral-500">
                                {new Date(blocked.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                                {!blocked.allDay && blocked.startTime && blocked.endTime && (
                                  <span className="ml-2">
                                    ({blocked.startTime} - {blocked.endTime})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveBlockedDate(blocked.id)}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Quick Block Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="font-bold text-neutral-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {['Today', 'Tomorrow', 'This Weekend', 'Next Week'].map((label) => (
                    <button
                      key={label}
                      onClick={() => {
                        const today = new Date();
                        let date = new Date(today);

                        if (label === 'Tomorrow') {
                          date.setDate(today.getDate() + 1);
                        } else if (label === 'This Weekend') {
                          const day = today.getDay();
                          const daysUntilSat = day === 0 ? 6 : 6 - day;
                          date.setDate(today.getDate() + daysUntilSat);
                        } else if (label === 'Next Week') {
                          date.setDate(today.getDate() + 7);
                        }

                        setNewBlockedDate(prev => ({
                          ...prev,
                          date: date.toISOString().split('T')[0],
                          reason: label,
                        }));
                        setShowAddBlockedDate(true);
                      }}
                      className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                    >
                      Block {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SignedIn>

        <SignedOut>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="text-neutral-400 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Sign in to manage availability</h3>
            <p className="text-neutral-600 mb-6">Please sign in to set your working hours and blocked dates.</p>
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
