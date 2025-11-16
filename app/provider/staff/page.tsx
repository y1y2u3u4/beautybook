'use client';

import { useTestUser } from '@/hooks/useTestUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, DollarSign, Edit, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';

type StaffRole = 'OWNER' | 'MANAGER' | 'STYLIST' | 'ESTHETICIAN' | 'MASSAGE_THERAPIST' | 'NAIL_TECHNICIAN' | 'RECEPTIONIST';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  hireDate: string;
  active: boolean;
  commissionRate?: number;
  salary?: number;
  appointmentsThisMonth: number;
  revenueThisMonth: number;
}

const roleLabels: Record<StaffRole, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  STYLIST: 'Stylist',
  ESTHETICIAN: 'Esthetician',
  MASSAGE_THERAPIST: 'Massage Therapist',
  NAIL_TECHNICIAN: 'Nail Technician',
  RECEPTIONIST: 'Receptionist',
};

const roleColors: Record<StaffRole, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  STYLIST: 'bg-green-100 text-green-700',
  ESTHETICIAN: 'bg-pink-100 text-pink-700',
  MASSAGE_THERAPIST: 'bg-indigo-100 text-indigo-700',
  NAIL_TECHNICIAN: 'bg-orange-100 text-orange-700',
  RECEPTIONIST: 'bg-neutral-100 text-neutral-700',
};

export default function ProviderStaff() {
  const { testUser, isTestMode, isLoading } = useTestUser();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedRole, setSelectedRole] = useState<StaffRole | 'all'>('all');

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

  const staffMembers: StaffMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@beautybook.com',
      phone: '(310) 555-0123',
      role: 'OWNER',
      hireDate: '2020-01-15',
      active: true,
      salary: 80000,
      appointmentsThisMonth: 45,
      revenueThisMonth: 9500,
    },
    {
      id: '2',
      name: 'Amanda Martinez',
      email: 'amanda.m@beautybook.com',
      phone: '(310) 555-0124',
      role: 'ESTHETICIAN',
      hireDate: '2021-06-01',
      active: true,
      commissionRate: 40,
      appointmentsThisMonth: 38,
      revenueThisMonth: 7200,
    },
    {
      id: '3',
      name: 'Jessica Wong',
      email: 'jessica.w@beautybook.com',
      phone: '(310) 555-0125',
      role: 'STYLIST',
      hireDate: '2022-03-15',
      active: true,
      commissionRate: 35,
      appointmentsThisMonth: 42,
      revenueThisMonth: 6800,
    },
    {
      id: '4',
      name: 'Maria Garcia',
      email: 'maria.g@beautybook.com',
      phone: '(310) 555-0126',
      role: 'RECEPTIONIST',
      hireDate: '2022-09-01',
      active: true,
      salary: 45000,
      appointmentsThisMonth: 0,
      revenueThisMonth: 0,
    },
    {
      id: '5',
      name: 'Rachel Kim',
      email: 'rachel.k@beautybook.com',
      phone: '(310) 555-0127',
      role: 'MASSAGE_THERAPIST',
      hireDate: '2021-01-10',
      active: false,
      commissionRate: 45,
      appointmentsThisMonth: 0,
      revenueThisMonth: 0,
    },
  ];

  const filteredStaff = staffMembers.filter(staff => {
    const statusMatch = filter === 'all' ||
      (filter === 'active' && staff.active) ||
      (filter === 'inactive' && !staff.active);
    const roleMatch = selectedRole === 'all' || staff.role === selectedRole;
    return statusMatch && roleMatch;
  });

  const activeStaff = staffMembers.filter(s => s.active).length;
  const totalRevenue = staffMembers.reduce((sum, s) => sum + s.revenueThisMonth, 0);
  const totalAppointments = staffMembers.reduce((sum, s) => sum + s.appointmentsThisMonth, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Staff Management</h1>
              <p className="text-neutral-600 mt-1">Manage your team and assign appointments</p>
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
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="text-3xl font-bold text-neutral-900 mb-1">
              {activeStaff}
            </div>
            <div className="text-sm text-neutral-600">Active Staff</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="text-3xl font-bold text-green-600 mb-1">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600">Total Revenue</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {totalAppointments}
            </div>
            <div className="text-sm text-neutral-600">Total Appointments</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {activeStaff > 0 ? (totalRevenue / activeStaff).toFixed(0) : 0}
            </div>
            <div className="text-sm text-neutral-600">Avg. per Staff</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-neutral-700">Status:</span>
              {(['all', 'active', 'inactive'] as const).map((status) => (
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

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-700">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as StaffRole | 'all')}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Roles</option>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <button className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              <Plus className="w-5 h-5" />
              Add Staff
            </button>
          </div>
        </div>

        {/* Staff List */}
        <div className="space-y-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-neutral-900">
                        {staff.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[staff.role]}`}>
                        {roleLabels[staff.role]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {staff.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {staff.phone}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Joined {new Date(staff.hireDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {staff.active ? (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1 bg-neutral-200 text-neutral-600 rounded-full text-sm font-semibold">
                      <XCircle className="w-4 h-4" />
                      Inactive
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 bg-neutral-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Appointments</div>
                    <div className="font-semibold text-neutral-900">
                      {staff.appointmentsThisMonth}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Revenue</div>
                    <div className="font-semibold text-green-600">
                      ${staff.revenueThisMonth.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Compensation</div>
                    <div className="font-semibold text-neutral-900">
                      {staff.commissionRate ? `${staff.commissionRate}% Commission` : `$${staff.salary?.toLocaleString()}/yr`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Avg. per Appt</div>
                    <div className="font-semibold text-neutral-900">
                      {staff.appointmentsThisMonth > 0
                        ? `$${(staff.revenueThisMonth / staff.appointmentsThisMonth).toFixed(0)}`
                        : '$0'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  <Calendar className="w-4 h-4" />
                  View Schedule
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-300 transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit Details
                </button>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Test Mode Notice */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧪</div>
            <div>
              <div className="font-bold text-yellow-900 mb-1">
                Test Mode - Staff Management
              </div>
              <p className="text-yellow-800 text-sm">
                This is sample staff data. In production, you can add staff members, assign them to appointments, track their performance, and manage schedules. All changes require database connection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
