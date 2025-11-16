'use client';

import { useTestUser } from '@/hooks/useTestUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, DollarSign, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';

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

export default function ProviderAppointments() {
  const { testUser, isTestMode, isLoading } = useTestUser();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');

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
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
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
        </div>

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
