'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, DollarSign, CheckCircle, XCircle, AlertCircle, Users, Zap, X, Loader2 } from 'lucide-react';

type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

interface Appointment {
  id: string;
  customerId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  amount: number;
  staffMemberId?: string | null;
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl?: string | null;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  staffMember?: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
}

interface StaffMember {
  id: string;
  user: {
    firstName: string | null;
    lastName: string | null;
  };
}

type AssignmentStrategy = 'balanced' | 'skill-based' | 'availability' | 'random';

export default function ProviderAppointments() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<AssignmentStrategy>('balanced');
  const [assignmentResult, setAssignmentResult] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch appointments and staff in parallel
        const [appointmentsRes, staffRes] = await Promise.all([
          fetch('/api/appointments?role=provider'),
          fetch('/api/staff'),
        ]);

        const appointmentsData = await appointmentsRes.json();
        const staffData = await staffRes.json();

        if (!appointmentsRes.ok) {
          throw new Error(appointmentsData.error || 'Failed to load appointments');
        }

        setAppointments(appointmentsData.appointments || []);
        setDataSource(appointmentsData.source || '');

        if (staffRes.ok) {
          setStaffMembers(staffData.staff || staffData.staffMembers || []);
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchData();
    }
  }, [isSignedIn]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    if (dataSource === 'mock') {
      // For demo, update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
      return;
    }

    try {
      setActionLoading(appointmentId);

      const endpoint = newStatus === 'CANCELLED'
        ? `/api/appointments/${appointmentId}/cancel`
        : `/api/appointments/${appointmentId}`;

      const response = await fetch(endpoint, {
        method: newStatus === 'CANCELLED' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update appointment');
      }

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    } catch (err: any) {
      console.error('Failed to update appointment:', err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === filter);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'NO_SHOW':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'SCHEDULED':
        return <AlertCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'NO_SHOW':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (timeStr: string) => {
    // Handle both ISO strings and HH:mm format
    if (timeStr.includes('T')) {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Smart assignment logic
  const handleSmartAssignment = () => {
    const unassignedAppointments = appointments.filter(
      apt => !apt.staffMemberId && (apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED')
    );

    if (unassignedAppointments.length === 0) {
      setAssignmentResult('No unassigned appointments found');
      setTimeout(() => setAssignmentResult(null), 3000);
      return;
    }

    if (staffMembers.length === 0) {
      setAssignmentResult('No staff members available');
      setTimeout(() => setAssignmentResult(null), 3000);
      return;
    }

    // Update appointments locally (in demo mode, this won't persist)
    const updatedAppointments = [...appointments];
    let assignedCount = 0;

    switch (selectedStrategy) {
      case 'balanced':
        unassignedAppointments.forEach((apt, index) => {
          const staffMember = staffMembers[index % staffMembers.length];
          const aptIndex = updatedAppointments.findIndex(a => a.id === apt.id);
          if (aptIndex !== -1) {
            updatedAppointments[aptIndex] = {
              ...updatedAppointments[aptIndex],
              staffMemberId: staffMember.id,
              staffMember,
            };
            assignedCount++;
          }
        });
        break;

      case 'availability':
        const staffWorkload = staffMembers.map(staff => ({
          ...staff,
          count: appointments.filter(apt => apt.staffMemberId === staff.id).length,
        }));

        unassignedAppointments.forEach((apt) => {
          staffWorkload.sort((a, b) => a.count - b.count);
          const aptIndex = updatedAppointments.findIndex(a => a.id === apt.id);
          if (aptIndex !== -1) {
            const staffMember = staffWorkload[0];
            updatedAppointments[aptIndex] = {
              ...updatedAppointments[aptIndex],
              staffMemberId: staffMember.id,
              staffMember: { id: staffMember.id, user: staffMember.user },
            };
            staffWorkload[0].count++;
            assignedCount++;
          }
        });
        break;

      case 'random':
      default:
        unassignedAppointments.forEach((apt) => {
          const randomIndex = Math.floor(Math.random() * staffMembers.length);
          const staffMember = staffMembers[randomIndex];
          const aptIndex = updatedAppointments.findIndex(a => a.id === apt.id);
          if (aptIndex !== -1) {
            updatedAppointments[aptIndex] = {
              ...updatedAppointments[aptIndex],
              staffMemberId: staffMember.id,
              staffMember,
            };
            assignedCount++;
          }
        });
        break;
    }

    setAppointments(updatedAppointments);
    setAssignmentResult(`Successfully assigned ${assignedCount} appointments!`);
    setShowAssignmentModal(false);
    setTimeout(() => setAssignmentResult(null), 3000);
  };

  const unassignedCount = appointments.filter(
    apt => !apt.staffMemberId && (apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED')
  ).length;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Appointment Management
              </h1>
              <p className="text-neutral-600 mt-1">
                View and manage your upcoming appointments
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
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Filters and Smart Assignment */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-neutral-700">Filter:</span>
              {(['all', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    filter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Smart Assignment Button */}
            {staffMembers.length > 0 && (
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                <Zap className="w-4 h-4" />
                Smart Assignment
                {unassignedCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {unassignedCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Assignment Result Notification */}
        {assignmentResult && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-semibold">{assignmentResult}</p>
          </div>
        )}

        {/* Assignment Modal */}
        {showAssignmentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full my-8 max-h-[90vh] flex flex-col">
              {/* Header - Fixed */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
                  <span className="line-clamp-2">Smart Assignment</span>
                </h2>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors ml-2 flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-6">
                <div className="mb-6">
                  <p className="text-neutral-600 mb-4 text-sm sm:text-base">
                    Select an assignment strategy and the system will automatically assign unassigned appointments to appropriate staff members.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-purple-900">
                      Unassigned Appointments: <span className="text-purple-600">{unassignedCount}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-neutral-700 block mb-2">
                    Assignment Strategy:
                  </label>

                  {[
                    { value: 'balanced', label: 'Balanced Distribution', desc: 'Evenly distribute across all staff to ensure balanced workload' },
                    { value: 'availability', label: 'Workload Priority', desc: 'Prioritize staff members with fewer current appointments' },
                    { value: 'random', label: 'Random Assignment', desc: 'Randomly assign to available staff members' },
                  ].map((strategy) => (
                    <button
                      key={strategy.value}
                      onClick={() => setSelectedStrategy(strategy.value as AssignmentStrategy)}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        selectedStrategy === strategy.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-neutral-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          selectedStrategy === strategy.value
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-neutral-300'
                        }`}>
                          {selectedStrategy === strategy.value && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral-900 mb-1 text-sm sm:text-base">
                            {strategy.label}
                          </div>
                          <div className="text-xs sm:text-sm text-neutral-600">
                            {strategy.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Buttons - Fixed */}
              <div className="flex gap-3 p-6 border-t border-neutral-200 flex-shrink-0">
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSmartAssignment}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md min-h-[44px]"
                >
                  Start Assignment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
              <div className="text-neutral-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No appointments found
              </h3>
              <p className="text-neutral-600">
                {filter === 'all'
                  ? 'You have no appointments yet'
                  : `No ${filter.toLowerCase()} appointments`}
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {appointment.customer.imageUrl ? (
                      <img
                        src={appointment.customer.imageUrl}
                        alt={`${appointment.customer.firstName} ${appointment.customer.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {appointment.customer.firstName?.charAt(0) || appointment.customer.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">
                        {appointment.customer.firstName || ''} {appointment.customer.lastName || ''}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {appointment.customer.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span className="text-sm font-semibold capitalize">
                      {appointment.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 bg-neutral-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="font-semibold">Date:</span>
                      <span>{formatDate(appointment.date)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-700">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span className="font-semibold">Time:</span>
                      <span>{formatTime(appointment.startTime)} ({appointment.service.duration} min)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <MapPin className="w-4 h-4 text-neutral-500" />
                      <span className="font-semibold">Service:</span>
                      <span>{appointment.service.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-700">
                      <DollarSign className="w-4 h-4 text-neutral-500" />
                      <span className="font-semibold">Price:</span>
                      <span className="text-green-600 font-bold">${appointment.amount}</span>
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-semibold text-blue-900 mb-1">Notes:</div>
                    <div className="text-sm text-blue-800">{appointment.notes}</div>
                  </div>
                )}

                {/* Staff Assignment */}
                {staffMembers.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-2">
                      <Users className="w-4 h-4" />
                      Assigned Staff Member:
                    </div>
                    {appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED' ? (
                      <div className="text-sm text-purple-800">
                        {appointment.staffMember
                          ? `${appointment.staffMember.user.firstName || ''} ${appointment.staffMember.user.lastName || ''}`.trim() || 'Staff Member'
                          : 'Not assigned'}
                      </div>
                    ) : (
                      <div className="text-sm text-purple-800">
                        {appointment.staffMember
                          ? `${appointment.staffMember.user.firstName || ''} ${appointment.staffMember.user.lastName || ''}`.trim() || 'Staff Member'
                          : 'Not assigned'}
                      </div>
                    )}
                  </div>
                )}

                {appointment.status === 'SCHEDULED' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(appointment.id, 'CONFIRMED')}
                      disabled={actionLoading === appointment.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === appointment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        'Confirm Appointment'
                      )}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(appointment.id, 'CANCELLED')}
                      disabled={actionLoading === appointment.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {appointment.status === 'CONFIRMED' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                      disabled={actionLoading === appointment.id}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === appointment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        'Mark as Completed'
                      )}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(appointment.id, 'CANCELLED')}
                      disabled={actionLoading === appointment.id}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Data Source Notice */}
        {dataSource === 'mock' && (
          <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">Demo</div>
              <div>
                <div className="font-bold text-yellow-900 mb-1">
                  Demo Mode - Appointment Management
                </div>
                <p className="text-yellow-800 text-sm">
                  These are sample appointments for testing. Actions will update the local view but won&apos;t persist without a database connection.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
