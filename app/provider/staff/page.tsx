'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Calendar, DollarSign, Edit, Trash2, Plus, CheckCircle, XCircle, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

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

// Mock staff data
const mockStaff: StaffMember[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(310) 555-0123', role: 'OWNER', hireDate: '2020-01-15', active: true, salary: 80000, appointmentsThisMonth: 45, revenueThisMonth: 9500 },
  { id: '2', name: 'Amanda Martinez', email: 'amanda@example.com', phone: '(310) 555-0124', role: 'ESTHETICIAN', hireDate: '2021-06-01', active: true, commissionRate: 40, appointmentsThisMonth: 38, revenueThisMonth: 7200 },
  { id: '3', name: 'David Kim', email: 'david@example.com', phone: '(310) 555-0125', role: 'MASSAGE_THERAPIST', hireDate: '2022-03-15', active: true, commissionRate: 45, appointmentsThisMonth: 32, revenueThisMonth: 6400 },
  { id: '4', name: 'Jennifer Lee', email: 'jennifer@example.com', phone: '(310) 555-0126', role: 'RECEPTIONIST', hireDate: '2023-01-10', active: true, salary: 45000, appointmentsThisMonth: 0, revenueThisMonth: 0 },
  { id: '5', name: 'Michael Brown', email: 'michael@example.com', phone: '(310) 555-0127', role: 'STYLIST', hireDate: '2021-09-01', active: false, commissionRate: 35, appointmentsThisMonth: 0, revenueThisMonth: 0 },
];

export default function ProviderStaffPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedRole, setSelectedRole] = useState<StaffRole | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STYLIST' as StaffRole,
    hireDate: new Date().toISOString().split('T')[0],
    active: true,
    commissionRate: 0,
    salary: 0,
    payType: 'commission' as 'commission' | 'salary',
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchStaff();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      // Sync user first
      await fetch('/api/users/sync', { method: 'POST' });

      // For now use mock data - in production would fetch from API
      setStaffMembers(mockStaff);
      setDataSource('mock');
    } catch (err: any) {
      console.error('Failed to fetch staff:', err);
      setStaffMembers(mockStaff);
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // For demo, add locally
      const newStaff: StaffMember = {
        id: `temp_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        hireDate: formData.hireDate,
        active: formData.active,
        commissionRate: formData.payType === 'commission' ? formData.commissionRate : undefined,
        salary: formData.payType === 'salary' ? formData.salary : undefined,
        appointmentsThisMonth: 0,
        revenueThisMonth: 0,
      };
      setStaffMembers([...staffMembers, newStaff]);
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaff || !formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Update locally for demo
      setStaffMembers(staffMembers.map(s => s.id === selectedStaff.id ? {
        ...s,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        hireDate: formData.hireDate,
        active: formData.active,
        commissionRate: formData.payType === 'commission' ? formData.commissionRate : undefined,
        salary: formData.payType === 'salary' ? formData.salary : undefined,
      } : s));
      setShowEditModal(false);
      setSelectedStaff(null);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    setSaving(true);
    setError(null);

    try {
      // Delete locally for demo
      setStaffMembers(staffMembers.filter(s => s.id !== selectedStaff.id));
      setShowDeleteModal(false);
      setSelectedStaff(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'STYLIST',
      hireDate: new Date().toISOString().split('T')[0],
      active: true,
      commissionRate: 0,
      salary: 0,
      payType: 'commission',
    });
  };

  const openEditModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      hireDate: staff.hireDate,
      active: staff.active,
      commissionRate: staff.commissionRate || 0,
      salary: staff.salary || 0,
      payType: staff.salary ? 'salary' : 'commission',
    });
    setShowEditModal(true);
  };

  const filteredStaff = staffMembers.filter(staff => {
    if (filter === 'active' && !staff.active) return false;
    if (filter === 'inactive' && staff.active) return false;
    if (selectedRole !== 'all' && staff.role !== selectedRole) return false;
    return true;
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-neutral-600">Loading staff...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">BeautyBook</Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/provider/dashboard" className="text-neutral-600 hover:text-primary-600">Dashboard</Link>
              <Link href="/provider/staff" className="text-primary-600 font-medium">Staff</Link>
              <Link href="/provider/appointments" className="text-neutral-600 hover:text-primary-600">Appointments</Link>
            </nav>
            <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
            <SignedOut><Link href="/sign-in" className="btn-primary px-6 py-2">Sign In</Link></SignedOut>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Staff Management</h1>
            <p className="text-neutral-600 mt-1">Manage your team members and their roles</p>
          </div>
          <Link href="/provider/dashboard" className="text-primary-600 hover:text-primary-700 font-semibold">← Back to Dashboard</Link>
        </div>

        {/* Error/Demo Badge */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600">×</button>
          </div>
        )}

        {dataSource === 'mock' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-yellow-600">&#x26A0;</span>
            <div>
              <p className="font-semibold text-yellow-800">Demo Mode</p>
              <p className="text-sm text-yellow-700">Changes are temporary and will reset on page refresh.</p>
            </div>
          </div>
        )}

        <SignedIn>
          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-neutral-700">Status:</span>
                {(['all', 'active', 'inactive'] as const).map((status) => (
                  <button key={status} onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === status ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
                <span className="text-sm font-semibold text-neutral-700 ml-4">Role:</span>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                  <option value="all">All Roles</option>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => { resetForm(); setShowAddModal(true); }}
                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                <Plus className="w-5 h-5" />Add Staff Member
              </button>
            </div>
          </div>

          {/* Staff Grid */}
          {filteredStaff.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
              <User className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No staff members found</h3>
              <p className="text-neutral-600 mb-6">Add your first team member to get started.</p>
              <button onClick={() => { resetForm(); setShowAddModal(true); }}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700">Add Staff Member</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((staff) => (
                <div key={staff.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900">{staff.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[staff.role]}`}>
                          {roleLabels[staff.role]}
                        </span>
                      </div>
                    </div>
                    {staff.active ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Mail className="w-4 h-4" />{staff.email}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Phone className="w-4 h-4" />{staff.phone}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Calendar className="w-4 h-4" />Hired: {new Date(staff.hireDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <DollarSign className="w-4 h-4" />
                      {staff.salary ? `Salary: ${formatCurrency(staff.salary)}/yr` : `Commission: ${staff.commissionRate}%`}
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary-600">{staff.appointmentsThisMonth}</div>
                        <div className="text-xs text-neutral-600">Appointments</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(staff.revenueThisMonth)}</div>
                        <div className="text-xs text-neutral-600">Revenue</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(staff)}
                      className="flex-1 flex items-center justify-center gap-1 bg-primary-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-primary-700 text-sm">
                      <Edit className="w-4 h-4" />Edit
                    </button>
                    <button onClick={() => { setSelectedStaff(staff); setShowDeleteModal(true); }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SignedIn>

        <SignedOut>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <User className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Sign in to manage staff</h3>
            <p className="text-neutral-600 mb-6">Please sign in to add and manage your team members.</p>
            <Link href="/sign-in" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700">Sign In</Link>
          </div>
        </SignedOut>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">Add Staff Member</h2>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Full Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe" className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com" className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567" className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Role *</label>
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Hire Date *</label>
                    <input type="date" value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Compensation Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={formData.payType === 'commission'} onChange={() => setFormData({ ...formData, payType: 'commission' })}
                        className="w-4 h-4 text-primary-600" />
                      <span>Commission</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={formData.payType === 'salary'} onChange={() => setFormData({ ...formData, payType: 'salary' })}
                        className="w-4 h-4 text-primary-600" />
                      <span>Salary</span>
                    </label>
                  </div>
                </div>
                {formData.payType === 'commission' ? (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Commission Rate (%)</label>
                    <input type="number" value={formData.commissionRate} onChange={(e) => setFormData({ ...formData, commissionRate: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Annual Salary ($)</label>
                    <input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                )}
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded border-neutral-300" />
                  <span className="font-semibold text-neutral-700">Active</span>
                </label>
              </div>
              <div className="flex gap-3 p-6 border-t border-neutral-200">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200">Cancel</button>
                <button onClick={handleAddStaff} disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}Add Staff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedStaff && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">Edit Staff Member</h2>
                <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Full Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Role *</label>
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Hire Date *</label>
                    <input type="date" value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Compensation Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={formData.payType === 'commission'} onChange={() => setFormData({ ...formData, payType: 'commission' })}
                        className="w-4 h-4 text-primary-600" />
                      <span>Commission</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={formData.payType === 'salary'} onChange={() => setFormData({ ...formData, payType: 'salary' })}
                        className="w-4 h-4 text-primary-600" />
                      <span>Salary</span>
                    </label>
                  </div>
                </div>
                {formData.payType === 'commission' ? (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Commission Rate (%)</label>
                    <input type="number" value={formData.commissionRate} onChange={(e) => setFormData({ ...formData, commissionRate: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Annual Salary ($)</label>
                    <input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                )}
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded border-neutral-300" />
                  <span className="font-semibold text-neutral-700">Active</span>
                </label>
              </div>
              <div className="flex gap-3 p-6 border-t border-neutral-200">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200">Cancel</button>
                <button onClick={handleEditStaff} disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedStaff && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Remove Staff Member?</h2>
                <p className="text-neutral-600 mb-6">Are you sure you want to remove <strong>{selectedStaff.name}</strong> from your team?</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200">Cancel</button>
                  <button onClick={handleDeleteStaff} disabled={saving}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
