'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, User, DollarSign, Phone, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

interface Appointment {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  notes?: string;
  totalPrice: number;
  createdAt: string;
  service?: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  provider?: {
    id: string;
    businessName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export default function CustomerAppointmentsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchAppointments();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/appointments');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointments');
      }

      setAppointments(data.appointments || []);
      setDataSource(data.source || 'unknown');
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setCancellingId(appointmentId);

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel appointment');
      }

      // Refresh appointments list
      await fetchAppointments();
    } catch (err: any) {
      console.error('Failed to cancel appointment:', err);
      alert('Failed to cancel appointment: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'confirmed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Confirmed</span>;
      case 'PENDING':
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">Pending</span>;
      case 'CANCELLED':
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">Cancelled</span>;
      case 'COMPLETED':
      case 'completed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Completed</span>;
      case 'NO_SHOW':
      case 'no_show':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">No Show</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">{status}</span>;
    }
  };

  // Filter appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return aptDate >= now && !['CANCELLED', 'cancelled', 'COMPLETED', 'completed'].includes(apt.status);
  });

  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return aptDate < now || ['CANCELLED', 'cancelled', 'COMPLETED', 'completed'].includes(apt.status);
  });

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-neutral-600">Loading appointments...</span>
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
              <Link href="/providers" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Find Providers
              </Link>
              <Link href="/customer/appointments" className="text-primary-600 font-medium">
                My Appointments
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Appointments</h1>
            <p className="text-neutral-600 mt-1">View and manage your beauty appointments</p>
          </div>
          <Link
            href="/providers"
            className="btn-primary px-6 py-2"
          >
            Book New Appointment
          </Link>
        </div>

        {/* Data Source Badge */}
        {dataSource === 'mock' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-yellow-600">&#x26A0;</span>
            <div>
              <p className="font-semibold text-yellow-800">Demo Mode</p>
              <p className="text-sm text-yellow-700">
                Showing sample data. Database connection unavailable.
              </p>
            </div>
          </div>
        )}

        {/* Sign In Required */}
        <SignedOut>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="text-neutral-400 mb-4">
              <User className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Sign in to view your appointments
            </h3>
            <p className="text-neutral-600 mb-6">
              Please sign in to access your appointment history and bookings.
            </p>
            <Link
              href="/sign-in"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Error loading appointments</p>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchAppointments}
                  className="mt-2 text-sm text-red-800 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Upcoming Appointments ({upcomingAppointments.length})
            </h2>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
                <div className="text-neutral-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-neutral-600 mb-6">
                  Ready to book your next beauty treatment?
                </p>
                <Link
                  href="/providers"
                  className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Browse Providers
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                          {appointment.provider?.businessName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-neutral-900">
                            {appointment.provider?.businessName || 'Unknown Provider'}
                          </h3>
                          {appointment.provider?.user && (
                            <p className="text-neutral-600">
                              with {appointment.provider.user.firstName} {appointment.provider.user.lastName}
                            </p>
                          )}
                          <div className="mt-2">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 bg-neutral-50 rounded-lg p-4 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-neutral-700">
                          <Calendar className="w-4 h-4 text-neutral-500" />
                          <span className="font-semibold">Date:</span>
                          <span>{formatDate(appointment.startTime)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-neutral-700">
                          <Clock className="w-4 h-4 text-neutral-500" />
                          <span className="font-semibold">Time:</span>
                          <span>
                            {formatTime(appointment.startTime)}
                            {appointment.service && ` (${appointment.service.duration} min)`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-neutral-700">
                          <User className="w-4 h-4 text-neutral-500" />
                          <span className="font-semibold">Service:</span>
                          <span>{appointment.service?.name || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {appointment.provider && (
                          <div className="flex items-start gap-2 text-neutral-700">
                            <MapPin className="w-4 h-4 text-neutral-500 mt-1" />
                            <div>
                              <div className="font-semibold">Location:</div>
                              <div className="text-sm">
                                {appointment.provider.address}, {appointment.provider.city}, {appointment.provider.state} {appointment.provider.zipCode}
                              </div>
                            </div>
                          </div>
                        )}

                        {appointment.provider?.phone && (
                          <div className="flex items-center gap-2 text-neutral-700">
                            <Phone className="w-4 h-4 text-neutral-500" />
                            <span className="font-semibold">Phone:</span>
                            <span>{appointment.provider.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-neutral-700">
                          <DollarSign className="w-4 h-4 text-neutral-500" />
                          <span className="font-semibold">Price:</span>
                          <span className="text-green-600 font-bold">
                            ${appointment.totalPrice || appointment.service?.price || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {appointment.provider && (
                        <Link
                          href={`/providers/${appointment.provider.id}`}
                          className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
                        >
                          View Provider
                        </Link>
                      )}
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        disabled={cancellingId === appointment.id}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {cancellingId === appointment.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'Cancel'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Past Appointments ({pastAppointments.length})
              </h2>

              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 font-bold text-2xl">
                          {appointment.provider?.businessName?.charAt(0) || 'P'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-neutral-900">
                                {appointment.provider?.businessName || 'Unknown Provider'}
                              </h3>
                              <p className="text-neutral-600">
                                {appointment.service?.name || 'Service'} - {formatDate(appointment.startTime)}
                              </p>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>

                          {appointment.status.toLowerCase() === 'completed' && (
                            <div className="mt-4 flex gap-2">
                              <button className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                                Leave a Review
                              </button>
                              {appointment.provider && (
                                <Link
                                  href={`/providers/${appointment.provider.id}/book`}
                                  className="bg-neutral-200 text-neutral-700 px-6 py-2 rounded-lg font-semibold hover:bg-neutral-300 transition-colors"
                                >
                                  Book Again
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SignedIn>
      </div>
    </div>
  );
}
