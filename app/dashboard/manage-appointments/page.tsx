'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, DollarSign, Filter, UserPlus, Check, X, Loader2, ChevronDown } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  amount: number;
  paymentStatus: string;
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl: string | null;
  };
  service: {
    id: string;
    name: string;
    duration: number;
  };
  assignedTo: {
    id: string;
    name: string;
    title: string;
  } | null;
}

interface Staff {
  id: string;
  name: string;
  title: string;
  active: boolean;
}

const statusColors = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-neutral-100 text-neutral-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-orange-100 text-orange-700',
};

const statusLabels = {
  SCHEDULED: '已安排',
  CONFIRMED: '已确认',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  NO_SHOW: '未到店',
};

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterStaff]);

  const fetchData = async () => {
    try {
      // Fetch appointments
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterStaff !== 'all') params.set('staffId', filterStaff);

      const [appointmentsRes, staffRes] = await Promise.all([
        fetch(`/api/appointments/manage?${params.toString()}`),
        fetch('/api/staff'),
      ]);

      const appointmentsData = await appointmentsRes.json();
      const staffData = await staffRes.json();

      setAppointments(appointmentsData.appointments || []);
      setStaff(staffData.staff || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignToStaff = async (appointmentId: string, staffId: string | null) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId }),
      });

      if (response.ok) {
        await fetchData();
        setAssigningId(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to assign appointment');
      }
    } catch (error) {
      console.error('Error assigning appointment:', error);
      alert('Failed to assign appointment');
    }
  };

  const updateStatus = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getCustomerName = (customer: Appointment['customer']) => {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }
    return customer.email;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) >= today && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.date) < today || apt.status === 'COMPLETED'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">预约管理</h1>
        <p className="text-neutral-600">查看和管理所有客户预约</p>
      </div>

      {/* Filters */}
      <div className="card-glass mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              状态筛选
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部</option>
              <option value="SCHEDULED">已安排</option>
              <option value="CONFIRMED">已确认</option>
              <option value="COMPLETED">已完成</option>
              <option value="CANCELLED">已取消</option>
              <option value="NO_SHOW">未到店</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              员工筛选
            </label>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部员工</option>
              <option value="">未分配</option>
              {staff.filter(s => s.active).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card-glass">
          <p className="text-sm text-neutral-600 mb-1">即将到来</p>
          <p className="text-3xl font-bold gradient-text">{upcomingAppointments.length}</p>
        </div>
        <div className="card-glass">
          <p className="text-sm text-neutral-600 mb-1">未分配</p>
          <p className="text-3xl font-bold text-orange-600">
            {appointments.filter((a) => !a.assignedTo).length}
          </p>
        </div>
        <div className="card-glass">
          <p className="text-sm text-neutral-600 mb-1">已完成</p>
          <p className="text-3xl font-bold text-green-600">
            {appointments.filter((a) => a.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="card-glass">
          <p className="text-sm text-neutral-600 mb-1">总收入</p>
          <p className="text-3xl font-bold text-primary-600">
            {formatCurrency(
              appointments
                .filter((a) => a.paymentStatus === 'PAID')
                .reduce((sum, a) => sum + a.amount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">即将到来的预约</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                staff={staff}
                assigningId={assigningId}
                setAssigningId={setAssigningId}
                assignToStaff={assignToStaff}
                updateStatus={updateStatus}
                getCustomerName={getCustomerName}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">历史预约</h2>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                staff={staff}
                assigningId={assigningId}
                setAssigningId={setAssigningId}
                assignToStaff={assignToStaff}
                updateStatus={updateStatus}
                getCustomerName={getCustomerName}
                isPast
              />
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="card-glass text-center py-16">
          <div className="w-16 h-16 bg-neutral-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">暂无预约</h3>
          <p className="text-neutral-600">当客户通过您的分享链接预约时，预约信息会显示在这里</p>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({
  appointment,
  staff,
  assigningId,
  setAssigningId,
  assignToStaff,
  updateStatus,
  getCustomerName,
  isPast = false,
}: {
  appointment: Appointment;
  staff: Staff[];
  assigningId: string | null;
  setAssigningId: (id: string | null) => void;
  assignToStaff: (appointmentId: string, staffId: string | null) => void;
  updateStatus: (appointmentId: string, status: string) => void;
  getCustomerName: (customer: Appointment['customer']) => string;
  isPast?: boolean;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <div className={`card-glass ${isPast ? 'opacity-75' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Customer Info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center font-semibold text-primary-700">
            {getCustomerName(appointment.customer).charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">{getCustomerName(appointment.customer)}</h3>
            <p className="text-sm text-neutral-600">{appointment.customer.email}</p>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="flex flex-wrap gap-4 flex-1">
          <div>
            <p className="text-xs text-neutral-500 mb-1">服务</p>
            <p className="font-medium text-neutral-900">{appointment.service.name}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              日期
            </p>
            <p className="font-medium text-neutral-900">
              {new Date(appointment.date).toLocaleDateString('zh-CN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">
              <Clock className="w-3 h-3 inline mr-1" />
              时间
            </p>
            <p className="font-medium text-neutral-900">
              {appointment.startTime} - {appointment.endTime}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">
              <DollarSign className="w-3 h-3 inline mr-1" />
              金额
            </p>
            <p className="font-medium text-neutral-900">{formatCurrency(appointment.amount)}</p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex flex-col gap-3 items-end">
          {/* Status Badge */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                statusColors[appointment.status]
              }`}
            >
              {statusLabels[appointment.status]}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showStatusMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-10 min-w-[150px]">
                {Object.entries(statusLabels).map(([status, label]) => (
                  <button
                    key={status}
                    onClick={() => {
                      updateStatus(appointment.id, status);
                      setShowStatusMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-neutral-50 ${
                      status === appointment.status ? 'font-semibold' : ''
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Staff / Assign Button */}
          {appointment.assignedTo ? (
            <div className="text-sm">
              <p className="text-xs text-neutral-500 mb-1">分配给</p>
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">{appointment.assignedTo.name}</span>
                <button
                  onClick={() => assignToStaff(appointment.id, null)}
                  className="p-1 hover:bg-red-50 rounded text-red-600"
                  title="取消分配"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() =>
                  setAssigningId(assigningId === appointment.id ? null : appointment.id)
                }
                className="flex items-center gap-2 px-4 py-2 border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-all text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                分配员工
              </button>

              {assigningId === appointment.id && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-10 min-w-[200px]">
                  {staff
                    .filter((s) => s.active)
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => assignToStaff(appointment.id, s.id)}
                        className="w-full text-left px-4 py-2 hover:bg-primary-50"
                      >
                        <p className="font-medium text-neutral-900">{s.name}</p>
                        <p className="text-xs text-neutral-600">{s.title}</p>
                      </button>
                    ))}
                  {staff.filter((s) => s.active).length === 0 && (
                    <p className="px-4 py-2 text-sm text-neutral-500">暂无可用员工</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
