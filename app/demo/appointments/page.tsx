'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Filter,
  Download,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react';
import { format, startOfWeek, addDays, subDays } from 'date-fns';
import { mockAppointments, mockServices, mockStaff } from '@/lib/mock-data';

export default function AppointmentsDemo() {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [currentDate, setCurrentDate] = useState(new Date('2024-11-15'));
  const [appointments, setAppointments] = useState(mockAppointments);
  const [filters, setFilters] = useState({
    status: 'all',
    staff: 'all',
    service: 'all',
  });

  const filteredAppointments = appointments.filter((apt) => {
    if (filters.status !== 'all' && apt.status !== filters.status) return false;
    if (filters.staff !== 'all' && apt.staffId !== filters.staff) return false;
    if (filters.service !== 'all' && apt.serviceId !== filters.service) return false;

    if (view === 'day') {
      return apt.date === format(currentDate, 'yyyy-MM-dd');
    } else {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = addDays(weekStart, 6);
      const aptDate = new Date(apt.date);
      return aptDate >= weekStart && aptDate <= weekEnd;
    }
  });

  const handlePrevious = () => {
    setCurrentDate(view === 'day' ? subDays(currentDate, 1) : subDays(currentDate, 7));
  };

  const handleNext = () => {
    setCurrentDate(view === 'day' ? addDays(currentDate, 1) : addDays(currentDate, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date('2024-11-15'));
  };

  const handleConfirm = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'CONFIRMED' } : apt
      )
    );
    alert('Appointment confirmed!');
  };

  const handleCancel = (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'CANCELLED' } : apt
      )
    );
    alert('Appointment cancelled!');
  };

  const handleComplete = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'COMPLETED' } : apt
      )
    );
    alert('Appointment marked as completed!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/demo"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Appointment Management</h1>
                <p className="text-sm text-gray-600">
                  Manage your bookings and schedule
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex items-center gap-2">
                <Download size={18} />
                Export
              </button>
              <button className="btn-primary flex items-center gap-2">
                <CalendarIcon size={18} />
                Add Block Time
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleToday}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Today
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <h2 className="text-xl font-semibold">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                {['day', 'week'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v as any)}
                    className={`px-4 py-2 rounded-md transition-colors font-medium ${
                      view === v
                        ? 'bg-white shadow text-purple-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={filters.staff}
              onChange={(e) => setFilters({ ...filters, staff: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Staff</option>
              {mockStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>

            <select
              value={filters.service}
              onChange={(e) => setFilters({ ...filters, service: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Services</option>
              {mockServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search customer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No appointments found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold">{filteredAppointments.length}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-blue-600 mb-1">Confirmed</div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredAppointments.filter((a) => a.status === 'CONFIRMED').length}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-green-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredAppointments.filter((a) => a.status === 'COMPLETED').length}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-purple-600 mb-1">Revenue</div>
            <div className="text-2xl font-bold text-purple-600">
              ${filteredAppointments.reduce((sum, a) => sum + a.amount, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, onConfirm, onCancel, onComplete }) {
  const statusColors = {
    SCHEDULED: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    CONFIRMED: 'bg-blue-100 border-blue-400 text-blue-800',
    COMPLETED: 'bg-green-100 border-green-400 text-green-800',
    CANCELLED: 'bg-red-100 border-red-400 text-red-800',
  };

  const statusIcons = {
    SCHEDULED: <Clock size={16} />,
    CONFIRMED: <CheckCircle size={16} />,
    COMPLETED: <CheckCircle size={16} />,
    CANCELLED: <XCircle size={16} />,
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Time */}
        <div className="flex-shrink-0 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {appointment.startTime.split(':')[0]}
          </div>
          <div className="text-sm text-gray-600">
            {parseInt(appointment.startTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {appointment.service.duration}m
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {appointment.customer.firstName} {appointment.customer.lastName}
              </h3>
              <p className="text-sm text-gray-600">{appointment.service.name}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium ${
                statusColors[appointment.status]
              }`}
            >
              {statusIcons[appointment.status]}
              {appointment.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={16} />
              <span>Staff: {appointment.staff.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} />
              <span>
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
          </div>

          {appointment.notes && (
            <div className="mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <span className="font-medium">Notes:</span> {appointment.notes}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900">
              ${appointment.amount.toFixed(2)}
              <span
                className={`ml-2 text-xs font-normal ${
                  appointment.paymentStatus === 'PAID'
                    ? 'text-green-600'
                    : 'text-orange-600'
                }`}
              >
                {appointment.paymentStatus}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {appointment.status === 'SCHEDULED' && (
                <>
                  <button
                    onClick={() => onConfirm(appointment.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => onCancel(appointment.id)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
              {appointment.status === 'CONFIRMED' && (
                <>
                  <button
                    onClick={() => onComplete(appointment.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => onCancel(appointment.id)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
              {appointment.status === 'COMPLETED' && (
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
