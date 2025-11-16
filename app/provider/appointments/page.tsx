'use client';

import { useTestUser } from '@/hooks/useTestUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, DollarSign, CheckCircle, XCircle, AlertCircle, Users, Zap, X } from 'lucide-react';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  assignedStaff?: string;
}

type AssignmentStrategy = 'balanced' | 'skill-based' | 'availability' | 'random';

export default function ProviderAppointments() {
  const { testUser, isTestMode, isLoading } = useTestUser();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<AssignmentStrategy>('balanced');
  const [assignmentResult, setAssignmentResult] = useState<string | null>(null);

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

  const staffMembers = [
    { id: 'staff_1', name: 'Sarah Johnson' },
    { id: 'staff_2', name: 'Amanda Martinez' },
    { id: 'staff_3', name: 'Jessica Wong' },
  ];

  const appointments: Appointment[] = [
    {
      id: '1',
      customerName: 'Jessica Smith',
      customerEmail: 'jessica.smith@example.com',
      customerPhone: '(555) 123-4567',
      service: 'Hydrating Facial',
      date: '2024-01-20',
      time: '2:00 PM',
      duration: 60,
      price: 150,
      status: 'confirmed',
      notes: 'First time customer, sensitive skin',
      assignedStaff: 'staff_2',
    },
    {
      id: '2',
      customerName: 'Michael Brown',
      customerEmail: 'michael.b@example.com',
      customerPhone: '(555) 234-5678',
      service: 'Anti-Aging Treatment',
      date: '2024-01-20',
      time: '4:30 PM',
      duration: 90,
      price: 300,
      status: 'confirmed',
      assignedStaff: 'staff_1',
    },
    {
      id: '3',
      customerName: 'Emma Wilson',
      customerEmail: 'emma.wilson@example.com',
      customerPhone: '(555) 345-6789',
      service: 'Chemical Peel',
      date: '2024-01-21',
      time: '10:00 AM',
      duration: 45,
      price: 250,
      status: 'pending',
    },
    {
      id: '4',
      customerName: 'David Martinez',
      customerEmail: 'david.m@example.com',
      customerPhone: '(555) 456-7890',
      service: 'Hydrating Facial',
      date: '2024-01-19',
      time: '3:00 PM',
      duration: 60,
      price: 150,
      status: 'completed',
    },
    {
      id: '5',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@example.com',
      customerPhone: '(555) 567-8901',
      service: 'Anti-Aging Treatment',
      date: '2024-01-18',
      time: '1:00 PM',
      duration: 90,
      price: 300,
      status: 'cancelled',
      notes: 'Cancelled by customer - rescheduled',
    },
  ];

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === filter);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
    }
  };

  // Smart assignment logic
  const handleSmartAssignment = () => {
    const unassignedAppointments = appointments.filter(
      apt => !apt.assignedStaff && (apt.status === 'pending' || apt.status === 'confirmed')
    );

    if (unassignedAppointments.length === 0) {
      setAssignmentResult('No unassigned appointments found');
      setTimeout(() => setAssignmentResult(null), 3000);
      return;
    }

    // Assign based on selected strategy
    let assignedCount = 0;

    switch (selectedStrategy) {
      case 'balanced':
        // Balanced distribution: Evenly distribute across all staff
        unassignedAppointments.forEach((apt, index) => {
          apt.assignedStaff = staffMembers[index % staffMembers.length].id;
          assignedCount++;
        });
        break;

      case 'skill-based':
        // Skill matching: Match services to staff expertise
        unassignedAppointments.forEach((apt) => {
          // Match based on service keywords
          if (apt.service.toLowerCase().includes('facial') || apt.service.toLowerCase().includes('skin')) {
            apt.assignedStaff = 'staff_1'; // Sarah - Facial specialist
          } else if (apt.service.toLowerCase().includes('massage') || apt.service.toLowerCase().includes('body')) {
            apt.assignedStaff = 'staff_3'; // Jessica - Massage specialist
          } else {
            apt.assignedStaff = 'staff_2'; // Amanda - General services
          }
          assignedCount++;
        });
        break;

      case 'availability':
        // Availability-based: Prioritize staff with fewer appointments
        const staffWorkload = staffMembers.map(staff => ({
          id: staff.id,
          count: appointments.filter(apt => apt.assignedStaff === staff.id).length
        }));

        unassignedAppointments.forEach((apt) => {
          // Find staff member with lowest workload
          staffWorkload.sort((a, b) => a.count - b.count);
          apt.assignedStaff = staffWorkload[0].id;
          staffWorkload[0].count++;
          assignedCount++;
        });
        break;

      case 'random':
        // Random assignment
        unassignedAppointments.forEach((apt) => {
          const randomIndex = Math.floor(Math.random() * staffMembers.length);
          apt.assignedStaff = staffMembers[randomIndex].id;
          assignedCount++;
        });
        break;
    }

    setAssignmentResult(`Successfully assigned ${assignedCount} appointments!`);
    setShowAssignmentModal(false);
    setTimeout(() => setAssignmentResult(null), 3000);
  };

  const unassignedCount = appointments.filter(
    apt => !apt.assignedStaff && (apt.status === 'pending' || apt.status === 'confirmed')
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
        {/* Filters and Smart Assignment */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-neutral-700">Filter:</span>
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    filter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Smart Assignment Button */}
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
                    { value: 'skill-based', label: 'Skill Matching', desc: 'Match appointments to staff based on service type and expertise' },
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
                No appointments match the selected filter.
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
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {appointment.customerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">
                        {appointment.customerName}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {appointment.customerEmail}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {appointment.customerPhone}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span className="text-sm font-semibold capitalize">
                      {appointment.status}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 bg-neutral-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="font-semibold">Date:</span>
                      <span>{new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-700">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span className="font-semibold">Time:</span>
                      <span>{appointment.time} ({appointment.duration} min)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <MapPin className="w-4 h-4 text-neutral-500" />
                      <span className="font-semibold">Service:</span>
                      <span>{appointment.service}</span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-700">
                      <DollarSign className="w-4 h-4 text-neutral-500" />
                      <span className="font-semibold">Price:</span>
                      <span className="text-green-600 font-bold">${appointment.price}</span>
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
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-2">
                    <Users className="w-4 h-4" />
                    Assigned Staff Member:
                  </div>
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') ? (
                    <select
                      value={appointment.assignedStaff || ''}
                      className="w-full px-3 py-2 border border-purple-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Not assigned</option>
                      {staffMembers.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-purple-800">
                      {appointment.assignedStaff
                        ? staffMembers.find(s => s.id === appointment.assignedStaff)?.name || 'Unknown'
                        : 'Not assigned'}
                    </div>
                  )}
                </div>

                {appointment.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Confirm Appointment
                    </button>
                    <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                      Decline
                    </button>
                  </div>
                )}

                {appointment.status === 'confirmed' && (
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Mark as Completed
                    </button>
                    <button className="flex-1 bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-300 transition-colors">
                      Reschedule
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Test Mode Notice */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧪</div>
            <div>
              <div className="font-bold text-yellow-900 mb-1">
                Test Mode - Appointment Management
              </div>
              <p className="text-yellow-800 text-sm">
                These are sample appointments for testing. Actions like &quot;Confirm&quot;, &quot;Complete&quot;, and &quot;Cancel&quot; will work in the UI but won&apos;t persist without database connection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
