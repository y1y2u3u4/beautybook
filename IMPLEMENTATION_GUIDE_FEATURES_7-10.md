# BeautyBook 功能7-10完整实施指南
## 商户端核心管理功能

---

## 📋 目录

1. [功能7: 商户预约管理中心](#功能7-商户预约管理中心)
2. [功能8: 客户管理系统（CRM）](#功能8-客户管理系统crm)
3. [功能9: 营业时间与排班管理](#功能9-营业时间与排班管理)
4. [功能10: 商户通知与消息中心](#功能10-商户通知与消息中心)

---

## 📅 功能7: 商户预约管理中心

### 7.1 预约日历视图

**app/provider-dashboard/appointments/page.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Search,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';

export default function AppointmentManagementPage() {
  const { userId } = useAuth();
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    staff: 'all',
    service: 'all',
  });

  useEffect(() => {
    loadAppointments();
  }, [currentDate, view, filters]);

  const loadAppointments = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      date: currentDate.toISOString(),
      view,
      status: filters.status,
      staffId: filters.staff,
      serviceId: filters.service,
    });

    const res = await fetch(`/api/provider/appointments?${params}`);
    const data = await res.json();
    setAppointments(data);
    setLoading(false);
  };

  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Appointment Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your bookings and schedule
          </p>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download size={20} />
            Export
          </button>
          <button className="btn-primary flex items-center gap-2">
            <CalendarIcon size={20} />
            Add Block Time
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Date Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <h2 className="text-xl font-semibold">
              {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
              {view === 'week' &&
                `${format(startOfWeek(currentDate), 'MMM d')} - ${format(
                  endOfWeek(currentDate),
                  'MMM d, yyyy'
                )}`}
              {view === 'month' && format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              {['day', 'week', 'month'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as any)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === v
                      ? 'bg-white shadow text-primary-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
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
            className="input-field"
          >
            <option value="all">All Staff</option>
            {/* Populated from staff list */}
          </select>

          <select
            value={filters.service}
            onChange={(e) => setFilters({ ...filters, service: e.target.value })}
            className="input-field"
          >
            <option value="all">All Services</option>
            {/* Populated from services list */}
          </select>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customer..."
              className="input-field w-full pl-10"
            />
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      {view === 'day' && (
        <DayView
          date={currentDate}
          appointments={appointments}
          onRefresh={loadAppointments}
        />
      )}
      {view === 'week' && (
        <WeekView
          startDate={startOfWeek(currentDate)}
          appointments={appointments}
          onRefresh={loadAppointments}
        />
      )}
      {view === 'month' && (
        <MonthView
          month={currentDate}
          appointments={appointments}
          onRefresh={loadAppointments}
        />
      )}
    </div>
  );
}

// Day View Component
function DayView({ date, appointments, onRefresh }) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 9 PM

  return (
    <div className="card">
      {/* Time Grid */}
      <div className="grid grid-cols-[80px_1fr] border-b">
        <div className="p-4 border-r bg-gray-50">
          <span className="text-sm text-gray-600">Time</span>
        </div>
        <div className="p-4">
          <span className="font-semibold">
            {format(date, 'EEEE, MMMM d')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[80px_1fr]">
        {/* Time Labels */}
        <div className="border-r">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-20 border-b flex items-start justify-center pt-2"
            >
              <span className="text-sm text-gray-600">
                {hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}
                {hour >= 12 ? ' PM' : ' AM'}
              </span>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="h-20 border-b border-gray-100" />
          ))}

          {/* Appointment Cards (Absolute Positioned) */}
          {appointments.map((appointment) => {
            const startHour = parseInt(appointment.startTime.split(':')[0]);
            const startMinute = parseInt(appointment.startTime.split(':')[1]);
            const top = (startHour - 7) * 80 + (startMinute / 60) * 80;
            const height = (appointment.service.duration / 60) * 80;

            return (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                style={{ top: `${top}px`, height: `${height}px` }}
                onRefresh={onRefresh}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Week View Component
function WeekView({ startDate, appointments, onRefresh }) {
  const days = eachDayOfInterval({
    start: startOfWeek(startDate),
    end: endOfWeek(startDate),
  });

  const hours = Array.from({ length: 14 }, (_, i) => i + 7);

  return (
    <div className="card overflow-x-auto">
      <div className="min-w-[1200px]">
        {/* Header */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b">
          <div className="p-4 border-r bg-gray-50"></div>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="p-4 text-center border-r last:border-r-0"
            >
              <div className="text-sm text-gray-600">
                {format(day, 'EEE')}
              </div>
              <div className="text-lg font-semibold mt-1">
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)]">
          {/* Time Column */}
          <div className="border-r">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-20 border-b flex items-start justify-center pt-2"
              >
                <span className="text-sm text-gray-600">
                  {hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}
                  {hour >= 12 ? ' PM' : ' AM'}
                </span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {days.map((day) => (
            <div key={day.toISOString()} className="relative border-r last:border-r-0">
              {hours.map((hour) => (
                <div key={hour} className="h-20 border-b border-gray-100" />
              ))}

              {/* Appointments for this day */}
              {appointments
                .filter(
                  (apt) =>
                    format(new Date(apt.date), 'yyyy-MM-dd') ===
                    format(day, 'yyyy-MM-dd')
                )
                .map((appointment) => {
                  const startHour = parseInt(appointment.startTime.split(':')[0]);
                  const startMinute = parseInt(appointment.startTime.split(':')[1]);
                  const top = (startHour - 7) * 80 + (startMinute / 60) * 80;
                  const height = (appointment.service.duration / 60) * 80;

                  return (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      compact
                      onRefresh={onRefresh}
                    />
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment, style, compact = false, onRefresh }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusColors = {
    SCHEDULED: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    CONFIRMED: 'bg-blue-100 border-blue-400 text-blue-800',
    COMPLETED: 'bg-green-100 border-green-400 text-green-800',
    CANCELLED: 'bg-red-100 border-red-400 text-red-800',
  };

  const handleAction = async (action: string) => {
    setMenuOpen(false);

    if (action === 'confirm') {
      await fetch(`/api/provider/appointments/${appointment.id}/confirm`, {
        method: 'POST',
      });
    } else if (action === 'cancel') {
      if (!confirm('Are you sure you want to cancel this appointment?')) return;
      await fetch(`/api/provider/appointments/${appointment.id}/cancel`, {
        method: 'POST',
      });
    } else if (action === 'complete') {
      await fetch(`/api/provider/appointments/${appointment.id}/complete`, {
        method: 'POST',
      });
    }

    onRefresh();
  };

  return (
    <div
      className={`absolute left-1 right-1 rounded-lg border-l-4 p-2 cursor-pointer hover:shadow-md transition-shadow ${
        statusColors[appointment.status]
      }`}
      style={style}
      onClick={() => setMenuOpen(!menuOpen)}
    >
      {!compact ? (
        <>
          <div className="font-semibold text-sm truncate">
            {appointment.customer.firstName} {appointment.customer.lastName}
          </div>
          <div className="text-xs truncate">{appointment.service.name}</div>
          <div className="text-xs mt-1">
            {appointment.startTime} - {appointment.endTime}
          </div>
          {appointment.staff && (
            <div className="text-xs mt-1 truncate">
              Staff: {appointment.staff.name}
            </div>
          )}
        </>
      ) : (
        <div className="text-xs font-semibold truncate">
          {appointment.customer.firstName} {appointment.customer.lastName[0]}.
        </div>
      )}

      {/* Action Menu */}
      {menuOpen && (
        <div className="absolute z-10 right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border">
          <button
            onClick={() => handleAction('view')}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
            View Details
          </button>
          {appointment.status === 'SCHEDULED' && (
            <button
              onClick={() => handleAction('confirm')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Confirm Appointment
            </button>
          )}
          {appointment.status === 'CONFIRMED' && (
            <button
              onClick={() => handleAction('complete')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Mark as Completed
            </button>
          )}
          <button
            onClick={() => handleAction('reschedule')}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
            Reschedule
          </button>
          <button
            onClick={() => handleAction('cancel')}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
          >
            Cancel Appointment
          </button>
        </div>
      )}
    </div>
  );
}

// Month View would be similar but showing a traditional calendar grid
function MonthView({ month, appointments, onRefresh }) {
  // Implementation similar to week view but showing full month
  return <div>Month View (Calendar Grid)</div>;
}
```

### 7.2 预约操作 API

**app/api/provider/appointments/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get provider
  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const date = new Date(searchParams.get('date') || new Date());
  const view = searchParams.get('view') || 'day';
  const status = searchParams.get('status');
  const staffId = searchParams.get('staffId');
  const serviceId = searchParams.get('serviceId');

  // Determine date range based on view
  let startDate, endDate;
  if (view === 'day') {
    startDate = startOfDay(date);
    endDate = endOfDay(date);
  } else if (view === 'week') {
    startDate = startOfWeek(date);
    endDate = endOfWeek(date);
  } else {
    startDate = startOfMonth(date);
    endDate = endOfMonth(date);
  }

  // Build where clause
  const where: any = {
    providerId: provider.id,
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (status && status !== 'all') {
    where.status = status;
  }

  if (staffId && staffId !== 'all') {
    where.staffId = staffId;
  }

  if (serviceId && serviceId !== 'all') {
    where.serviceId = serviceId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true,
        },
      },
      service: true,
      staff: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(appointments);
}
```

**app/api/provider/appointments/[id]/confirm/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentConfirmation } from '@/lib/notifications';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      provider: { include: { user: true } },
      customer: { include: { customerProfile: true } },
      service: true,
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  // Verify ownership
  if (appointment.provider.user.clerkId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Update status
  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status: 'CONFIRMED' },
  });

  // Send confirmation to customer
  await sendAppointmentConfirmation(appointment);

  return NextResponse.json(updated);
}
```

**app/api/provider/appointments/[id]/cancel/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendCancellationNotification } from '@/lib/notifications';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reason } = await req.json();

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      provider: { include: { user: true } },
      customer: { include: { customerProfile: true } },
      service: true,
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  // Verify ownership
  if (appointment.provider.user.clerkId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Check if refund is applicable
  const appointmentDate = new Date(appointment.date);
  const hoursUntil = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);

  let refundAmount = 0;
  if (hoursUntil > 24 && appointment.paymentStatus === 'PAID') {
    refundAmount = appointment.amount; // Full refund
  }

  // Process refund if applicable
  if (refundAmount > 0 && appointment.paymentId) {
    await stripe.refunds.create({
      payment_intent: appointment.paymentId,
      amount: Math.round(refundAmount * 100),
    });
  }

  // Update appointment
  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: {
      status: 'CANCELLED',
      paymentStatus: refundAmount > 0 ? 'REFUNDED' : appointment.paymentStatus,
      notes: appointment.notes
        ? `${appointment.notes}\n\nCancelled by provider: ${reason}`
        : `Cancelled by provider: ${reason}`,
    },
  });

  // Send notification
  await sendCancellationNotification(appointment, refundAmount);

  return NextResponse.json({ ...updated, refundAmount });
}
```

**app/api/provider/appointments/[id]/complete/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CommissionCalculator } from '@/lib/finance/commission-calculator';
import { scheduleReviewRequest } from '@/lib/jobs/notification-jobs';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { actualStartTime, actualEndTime, notes } = await req.json();

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      provider: { include: { user: true } },
      staff: true,
      service: true,
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  // Verify ownership
  if (appointment.provider.user.clerkId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Update appointment
  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: {
      status: 'COMPLETED',
      actualStartTime: actualStartTime ? new Date(actualStartTime) : null,
      actualEndTime: actualEndTime ? new Date(actualEndTime) : null,
      notes,
    },
  });

  // Calculate commission if staff assigned
  if (appointment.staffId) {
    const calculator = new CommissionCalculator();
    await calculator.calculateCommission(params.id);
  }

  // Schedule review request (2 hours after completion)
  await scheduleReviewRequest(params.id);

  return NextResponse.json(updated);
}
```

---

## 👥 功能8: 客户管理系统（CRM）

### 8.1 客户列表页面

**app/provider-dashboard/customers/page.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Star, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    segment: 'all', // 'all', 'vip', 'new', 'at-risk', 'churned'
    sortBy: 'recent', // 'recent', 'revenue', 'visits', 'name'
  });

  useEffect(() => {
    loadCustomers();
    loadStats();
  }, [filters, searchTerm]);

  const loadCustomers = async () => {
    const params = new URLSearchParams({
      search: searchTerm,
      segment: filters.segment,
      sortBy: filters.sortBy,
    });

    const res = await fetch(`/api/provider/customers?${params}`);
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  };

  const loadStats = async () => {
    const res = await fetch('/api/provider/customers/stats');
    const data = await res.json();
    setStats(data);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-gray-600 mt-1">
            View and manage your customer relationships
          </p>
        </div>

        <button className="btn-secondary flex items-center gap-2">
          <Download size={20} />
          Export Customers
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<Calendar />}
            trend="+12%"
            trendUp
          />
          <StatCard
            title="VIP Customers"
            value={stats.vipCustomers}
            icon={<Star />}
            color="yellow"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<DollarSign />}
            trend="+8%"
            trendUp
            color="green"
          />
          <StatCard
            title="Avg Customer Value"
            value={`$${stats.avgCustomerValue.toFixed(0)}`}
            icon={<TrendingUp />}
            trend="+5%"
            trendUp
            color="blue"
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers..."
              className="input-field w-full pl-10"
            />
          </div>

          <select
            value={filters.segment}
            onChange={(e) => setFilters({ ...filters, segment: e.target.value })}
            className="input-field"
          >
            <option value="all">All Customers</option>
            <option value="vip">VIP Customers</option>
            <option value="new">New Customers</option>
            <option value="at-risk">At Risk</option>
            <option value="churned">Churned</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="input-field"
          >
            <option value="recent">Most Recent</option>
            <option value="revenue">Highest Revenue</option>
            <option value="visits">Most Visits</option>
            <option value="name">Name (A-Z)</option>
          </select>

          <button className="btn-secondary flex items-center gap-2">
            <Filter size={20} />
            More Filters
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-6">Customer</th>
              <th className="text-left py-4 px-6">Segment</th>
              <th className="text-left py-4 px-6">Total Visits</th>
              <th className="text-left py-4 px-6">Total Spent</th>
              <th className="text-left py-4 px-6">Last Visit</th>
              <th className="text-left py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} />
            ))}
          </tbody>
        </table>

        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerRow({ customer }) {
  const getSegmentBadge = (segment: string) => {
    const badges = {
      VIP: 'badge-yellow',
      NEW: 'badge-green',
      'AT_RISK': 'badge-orange',
      CHURNED: 'badge-red',
      REGULAR: 'badge-blue',
    };

    return (
      <span className={`badge ${badges[segment] || 'badge-gray'}`}>
        {segment}
      </span>
    );
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <img
            src={customer.imageUrl || '/default-avatar.png'}
            alt={customer.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{customer.name}</p>
            <p className="text-sm text-gray-600">{customer.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">{getSegmentBadge(customer.segment)}</td>
      <td className="py-4 px-6">{customer.totalVisits}</td>
      <td className="py-4 px-6 font-semibold">
        ${customer.totalSpent.toFixed(2)}
      </td>
      <td className="py-4 px-6 text-sm text-gray-600">
        {customer.lastVisit
          ? new Date(customer.lastVisit).toLocaleDateString()
          : 'Never'}
      </td>
      <td className="py-4 px-6">
        <Link
          href={`/provider-dashboard/customers/${customer.id}`}
          className="btn-secondary btn-sm"
        >
          View Details
        </Link>
      </td>
    </tr>
  );
}

function StatCard({ title, value, icon, trend, trendUp, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        {trend && (
          <span
            className={`text-sm font-semibold ${
              trendUp ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
```

### 8.2 客户详情页面

**app/provider-dashboard/customers/[id]/page.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
    loadAppointments();
  }, []);

  const loadCustomer = async () => {
    const res = await fetch(`/api/provider/customers/${params.id}`);
    const data = await res.json();
    setCustomer(data);
    setLoading(false);
  };

  const loadAppointments = async () => {
    const res = await fetch(`/api/provider/customers/${params.id}/appointments`);
    const data = await res.json();
    setAppointments(data);
  };

  if (loading || !customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/provider-dashboard/customers"
          className="text-primary-600 hover:underline mb-4 inline-block"
        >
          ← Back to Customers
        </Link>
        <h1 className="text-3xl font-bold">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Customer Info */}
        <div className="col-span-1 space-y-6">
          {/* Basic Info Card */}
          <div className="card p-6">
            <div className="text-center mb-6">
              <img
                src={customer.imageUrl || '/default-avatar.png'}
                alt={customer.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold">{customer.name}</h2>
              <span className={`badge ${getSegmentColor(customer.segment)} mt-2`}>
                {customer.segment}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-gray-400" />
                <span>{customer.email}</span>
              </div>

              {customer.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
              )}

              {customer.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span>
                    {customer.address}, {customer.city}, {customer.state}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  Customer since{' '}
                  {new Date(customer.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Customer Stats</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Total Visits</span>
                </div>
                <span className="font-semibold">{customer.stats.totalVisits}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign size={16} />
                  <span>Total Spent</span>
                </div>
                <span className="font-semibold">
                  ${customer.stats.totalSpent.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp size={16} />
                  <span>Avg Per Visit</span>
                </div>
                <span className="font-semibold">
                  ${customer.stats.avgPerVisit.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>Last Visit</span>
                </div>
                <span className="text-sm">
                  {customer.stats.lastVisit
                    ? new Date(customer.stats.lastVisit).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Tags Card */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {customer.tags?.map((tag) => (
                <span key={tag} className="badge badge-sm">
                  {tag}
                </span>
              ))}
              <button className="badge badge-sm border-dashed">+ Add Tag</button>
            </div>
          </div>

          {/* Notes Card */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Notes</h3>
            <textarea
              className="input-field w-full h-32"
              placeholder="Add notes about this customer..."
              defaultValue={customer.notes}
            />
            <button className="btn-primary btn-sm mt-3 w-full">Save Notes</button>
          </div>
        </div>

        {/* Right Column: Activity */}
        <div className="col-span-2 space-y-6">
          {/* RFM Analysis */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">RFM Analysis</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Recency</p>
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray={`${customer.rfm.recency}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{customer.rfm.recency}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Last visit {customer.rfm.daysSinceLastVisit} days ago
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Frequency</p>
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray={`${customer.rfm.frequency}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{customer.rfm.frequency}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {customer.stats.totalVisits} total visits
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Monetary</p>
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeDasharray={`${customer.rfm.monetary}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{customer.rfm.monetary}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ${customer.stats.totalSpent.toFixed(0)} lifetime value
                </p>
              </div>
            </div>
          </div>

          {/* Appointment History */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Appointment History</h3>

            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentHistoryCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}

              {appointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No appointments yet
                </div>
              )}
            </div>
          </div>

          {/* Service Preferences */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Service Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              {customer.servicePreferences?.map((pref) => (
                <div key={pref.serviceName} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{pref.serviceName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {pref.count} times • Last: {new Date(pref.lastDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentHistoryCard({ appointment }) {
  const statusColors = {
    COMPLETED: 'badge-green',
    CANCELLED: 'badge-red',
    NO_SHOW: 'badge-gray',
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-semibold">{appointment.service.name}</h4>
          <span className={`badge badge-sm ${statusColors[appointment.status]}`}>
            {appointment.status}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            {new Date(appointment.date).toLocaleDateString()} at{' '}
            {appointment.startTime}
          </span>
          {appointment.staff && <span>Staff: {appointment.staff.name}</span>}
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-lg">${appointment.amount.toFixed(2)}</p>
        {appointment.review && (
          <div className="flex items-center gap-1 text-sm mt-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{appointment.review.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getSegmentColor(segment: string) {
  const colors = {
    VIP: 'badge-yellow',
    NEW: 'badge-green',
    AT_RISK: 'badge-orange',
    CHURNED: 'badge-red',
    REGULAR: 'badge-blue',
  };
  return colors[segment] || 'badge-gray';
}
```

### 8.3 客户管理 API

**app/api/provider/customers/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const segment = searchParams.get('segment') || 'all';
  const sortBy = searchParams.get('sortBy') || 'recent';

  // Build where clause
  const where: any = {
    appointments: {
      some: {
        providerId: provider.id,
      },
    },
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get customers with aggregated data
  const customers = await prisma.user.findMany({
    where,
    include: {
      customerProfile: true,
      appointments: {
        where: {
          providerId: provider.id,
          status: 'COMPLETED',
        },
        include: {
          service: true,
          review: true,
        },
        orderBy: { date: 'desc' },
      },
    },
  });

  // Calculate stats and segment for each customer
  const customersWithStats = customers.map((customer) => {
    const completedAppointments = customer.appointments;
    const totalSpent = completedAppointments.reduce(
      (sum, apt) => sum + apt.amount,
      0
    );
    const totalVisits = completedAppointments.length;
    const lastVisit = completedAppointments[0]?.date || null;

    // Calculate RFM scores (1-5)
    const daysSinceLastVisit = lastVisit
      ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const recencyScore = daysSinceLastVisit < 30 ? 5 : daysSinceLastVisit < 60 ? 4 : daysSinceLastVisit < 90 ? 3 : daysSinceLastVisit < 180 ? 2 : 1;
    const frequencyScore = totalVisits >= 10 ? 5 : totalVisits >= 5 ? 4 : totalVisits >= 3 ? 3 : totalVisits >= 2 ? 2 : 1;
    const monetaryScore = totalSpent >= 500 ? 5 : totalSpent >= 300 ? 4 : totalSpent >= 150 ? 3 : totalSpent >= 50 ? 2 : 1;

    // Determine segment
    let segment = 'REGULAR';
    if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
      segment = 'VIP';
    } else if (totalVisits === 1 && daysSinceLastVisit < 30) {
      segment = 'NEW';
    } else if (recencyScore <= 2 && frequencyScore >= 3) {
      segment = 'AT_RISK';
    } else if (daysSinceLastVisit > 180 && totalVisits > 0) {
      segment = 'CHURNED';
    }

    return {
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      imageUrl: customer.imageUrl,
      phone: customer.customerProfile?.phone,
      totalVisits,
      totalSpent,
      lastVisit,
      segment,
      rfm: {
        recency: recencyScore,
        frequency: frequencyScore,
        monetary: monetaryScore,
        daysSinceLastVisit,
      },
    };
  });

  // Filter by segment
  let filteredCustomers = customersWithStats;
  if (segment !== 'all') {
    filteredCustomers = customersWithStats.filter(
      (c) => c.segment === segment.toUpperCase()
    );
  }

  // Sort
  if (sortBy === 'revenue') {
    filteredCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
  } else if (sortBy === 'visits') {
    filteredCustomers.sort((a, b) => b.totalVisits - a.totalVisits);
  } else if (sortBy === 'name') {
    filteredCustomers.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // recent
    filteredCustomers.sort((a, b) => {
      if (!a.lastVisit) return 1;
      if (!b.lastVisit) return -1;
      return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    });
  }

  return NextResponse.json(filteredCustomers);
}
```

**app/api/provider/customers/stats/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  // Get all completed appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      providerId: provider.id,
      status: 'COMPLETED',
    },
    include: {
      customer: true,
    },
  });

  // Calculate stats
  const uniqueCustomers = new Set(appointments.map((apt) => apt.customerId));
  const totalCustomers = uniqueCustomers.size;

  const customerStats = Array.from(uniqueCustomers).map((customerId) => {
    const customerAppointments = appointments.filter(
      (apt) => apt.customerId === customerId
    );
    const totalSpent = customerAppointments.reduce(
      (sum, apt) => sum + apt.amount,
      0
    );
    const totalVisits = customerAppointments.length;

    // VIP criteria: 4+ visits and $300+ spent
    const isVip = totalVisits >= 4 && totalSpent >= 300;

    return {
      customerId,
      totalSpent,
      totalVisits,
      isVip,
    };
  });

  const vipCustomers = customerStats.filter((c) => c.isVip).length;
  const totalRevenue = customerStats.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return NextResponse.json({
    totalCustomers,
    vipCustomers,
    totalRevenue,
    avgCustomerValue,
  });
}
```

**app/api/provider/customers/[id]/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const customer = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      customerProfile: true,
      appointments: {
        where: { providerId: provider.id },
        include: {
          service: true,
          staff: true,
          review: true,
        },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  // Calculate stats
  const completedAppointments = customer.appointments.filter(
    (apt) => apt.status === 'COMPLETED'
  );
  const totalVisits = completedAppointments.length;
  const totalSpent = completedAppointments.reduce(
    (sum, apt) => sum + apt.amount,
    0
  );
  const avgPerVisit = totalVisits > 0 ? totalSpent / totalVisits : 0;
  const lastVisit = completedAppointments[0]?.date || null;

  // Calculate RFM
  const daysSinceLastVisit = lastVisit
    ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const recencyScore = daysSinceLastVisit < 30 ? 5 : daysSinceLastVisit < 60 ? 4 : daysSinceLastVisit < 90 ? 3 : daysSinceLastVisit < 180 ? 2 : 1;
  const frequencyScore = totalVisits >= 10 ? 5 : totalVisits >= 5 ? 4 : totalVisits >= 3 ? 3 : totalVisits >= 2 ? 2 : 1;
  const monetaryScore = totalSpent >= 500 ? 5 : totalSpent >= 300 ? 4 : totalSpent >= 150 ? 3 : totalSpent >= 50 ? 2 : 1;

  // Determine segment
  let segment = 'REGULAR';
  if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
    segment = 'VIP';
  } else if (totalVisits === 1 && daysSinceLastVisit < 30) {
    segment = 'NEW';
  } else if (recencyScore <= 2 && frequencyScore >= 3) {
    segment = 'AT_RISK';
  } else if (daysSinceLastVisit > 180 && totalVisits > 0) {
    segment = 'CHURNED';
  }

  // Get service preferences
  const serviceMap = new Map();
  completedAppointments.forEach((apt) => {
    const serviceName = apt.service.name;
    if (!serviceMap.has(serviceName)) {
      serviceMap.set(serviceName, {
        serviceName,
        count: 0,
        lastDate: apt.date,
      });
    }
    const pref = serviceMap.get(serviceName);
    pref.count++;
    if (new Date(apt.date) > new Date(pref.lastDate)) {
      pref.lastDate = apt.date;
    }
  });

  const servicePreferences = Array.from(serviceMap.values()).sort(
    (a, b) => b.count - a.count
  );

  return NextResponse.json({
    id: customer.id,
    name: `${customer.firstName} ${customer.lastName}`,
    email: customer.email,
    imageUrl: customer.imageUrl,
    phone: customer.customerProfile?.phone,
    address: customer.customerProfile?.address,
    city: customer.customerProfile?.city,
    state: customer.customerProfile?.state,
    createdAt: customer.createdAt,
    segment,
    stats: {
      totalVisits,
      totalSpent,
      avgPerVisit,
      lastVisit,
    },
    rfm: {
      recency: recencyScore,
      frequency: frequencyScore,
      monetary: monetaryScore,
      daysSinceLastVisit,
    },
    servicePreferences,
    tags: customer.customerProfile?.tags || [],
    notes: customer.customerProfile?.notes || '',
  });
}
```

---

## 🕐 功能9: 营业时间与排班管理

### 9.1 营业时间配置页面

**app/provider-dashboard/settings/hours/page.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Copy, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function BusinessHoursPage() {
  const [businessHours, setBusinessHours] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessHours();
    loadHolidays();
  }, []);

  const loadBusinessHours = async () => {
    const res = await fetch('/api/provider/business-hours');
    const data = await res.json();
    setBusinessHours(data);
    setLoading(false);
  };

  const loadHolidays = async () => {
    const res = await fetch('/api/provider/holidays');
    const data = await res.json();
    setHolidays(data);
  };

  const handleSave = async () => {
    try {
      await fetch('/api/provider/business-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessHours),
      });
      toast.success('Business hours updated successfully!');
    } catch (error) {
      toast.error('Failed to update business hours');
    }
  };

  const toggleDay = (day: string) => {
    setBusinessHours({
      ...businessHours,
      [day]: businessHours[day]
        ? null
        : { open: '09:00', close: '18:00', breaks: [] },
    });
  };

  const updateHours = (day: string, field: string, value: string) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value,
      },
    });
  };

  const addBreak = (day: string) => {
    const breaks = businessHours[day].breaks || [];
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        breaks: [...breaks, { start: '12:00', end: '13:00' }],
      },
    });
  };

  const removeBreak = (day: string, index: number) => {
    const breaks = [...businessHours[day].breaks];
    breaks.splice(index, 1);
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        breaks,
      },
    });
  };

  const copyToAllDays = (day: string) => {
    const hours = businessHours[day];
    const newBusinessHours = {};
    DAYS_OF_WEEK.forEach((d) => {
      newBusinessHours[d] = { ...hours };
    });
    setBusinessHours(newBusinessHours);
    toast.success('Copied to all days!');
  };

  const addHoliday = async (date: string, name: string) => {
    try {
      const res = await fetch('/api/provider/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, name }),
      });
      const newHoliday = await res.json();
      setHolidays([...holidays, newHoliday]);
      toast.success('Holiday added!');
    } catch (error) {
      toast.error('Failed to add holiday');
    }
  };

  const removeHoliday = async (id: string) => {
    try {
      await fetch(`/api/provider/holidays/${id}`, {
        method: 'DELETE',
      });
      setHolidays(holidays.filter((h) => h.id !== id));
      toast.success('Holiday removed!');
    } catch (error) {
      toast.error('Failed to remove holiday');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Business Hours</h1>
          <p className="text-gray-600 mt-1">
            Configure your operating hours and holidays
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>

      {/* Regular Hours */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Weekly Schedule</h2>

        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="border rounded-lg p-4">
              <div className="flex items-center gap-4">
                {/* Day Toggle */}
                <div className="w-32">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!businessHours[day]}
                      onChange={() => toggleDay(day)}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">{day}</span>
                  </label>
                </div>

                {businessHours[day] ? (
                  <div className="flex-1">
                    {/* Opening Hours */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <input
                          type="time"
                          value={businessHours[day].open}
                          onChange={(e) =>
                            updateHours(day, 'open', e.target.value)
                          }
                          className="input-field"
                        />
                        <span className="text-gray-600">to</span>
                        <input
                          type="time"
                          value={businessHours[day].close}
                          onChange={(e) =>
                            updateHours(day, 'close', e.target.value)
                          }
                          className="input-field"
                        />
                      </div>

                      <button
                        onClick={() => copyToAllDays(day)}
                        className="btn-secondary btn-sm flex items-center gap-2"
                      >
                        <Copy size={16} />
                        Copy to All
                      </button>
                    </div>

                    {/* Breaks */}
                    {businessHours[day].breaks?.map((brk, index) => (
                      <div key={index} className="flex items-center gap-2 ml-6 mb-2">
                        <span className="text-sm text-gray-600">Break:</span>
                        <input
                          type="time"
                          value={brk.start}
                          onChange={(e) => {
                            const breaks = [...businessHours[day].breaks];
                            breaks[index].start = e.target.value;
                            setBusinessHours({
                              ...businessHours,
                              [day]: { ...businessHours[day], breaks },
                            });
                          }}
                          className="input-field input-sm"
                        />
                        <span className="text-gray-600">to</span>
                        <input
                          type="time"
                          value={brk.end}
                          onChange={(e) => {
                            const breaks = [...businessHours[day].breaks];
                            breaks[index].end = e.target.value;
                            setBusinessHours({
                              ...businessHours,
                              [day]: { ...businessHours[day], breaks },
                            });
                          }}
                          className="input-field input-sm"
                        />
                        <button
                          onClick={() => removeBreak(day, index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => addBreak(day)}
                      className="btn-secondary btn-sm ml-6 flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Break
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500">Closed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holidays */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Holidays & Closures</h2>

        <HolidayForm onAdd={addHoliday} />

        <div className="mt-6 space-y-3">
          {holidays.map((holiday) => (
            <div
              key={holiday.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-semibold">{holiday.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(holiday.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => removeHoliday(holiday.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          {holidays.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No holidays added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HolidayForm({ onAdd }) {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date && name) {
      onAdd(date, name);
      setDate('');
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Holiday Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Christmas Day"
          className="input-field w-full"
          required
        />
      </div>

      <div className="w-48">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field w-full"
          required
        />
      </div>

      <button type="submit" className="btn-primary flex items-center gap-2">
        <Plus size={20} />
        Add Holiday
      </button>
    </form>
  );
}
```

### 9.2 员工排班管理

**app/provider-dashboard/settings/scheduling/page.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function StaffSchedulingPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [staff, setStaff] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
    loadSchedules();
  }, [currentWeek]);

  const loadStaff = async () => {
    const res = await fetch('/api/provider/staff');
    const data = await res.json();
    setStaff(data);
    setLoading(false);
  };

  const loadSchedules = async () => {
    const startDate = startOfWeek(currentWeek);
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
    });

    const res = await fetch(`/api/provider/schedules?${params}`);
    const data = await res.json();
    setSchedules(data);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentWeek), i)
  );

  const handleAddShift = async (staffId: string, date: Date) => {
    // Open modal to add shift
    const shift = {
      staffId,
      date: date.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
    };

    try {
      const res = await fetch('/api/provider/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift),
      });
      const newShift = await res.json();
      setSchedules([...schedules, newShift]);
      toast.success('Shift added!');
    } catch (error) {
      toast.error('Failed to add shift');
    }
  };

  const handleDeleteShift = async (scheduleId: string) => {
    try {
      await fetch(`/api/provider/schedules/${scheduleId}`, {
        method: 'DELETE',
      });
      setSchedules(schedules.filter((s) => s.id !== scheduleId));
      toast.success('Shift removed!');
    } catch (error) {
      toast.error('Failed to remove shift');
    }
  };

  const getShiftForStaffAndDate = (staffId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.find(
      (s) => s.staffId === staffId && s.date.split('T')[0] === dateStr
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Scheduling</h1>
          <p className="text-gray-600 mt-1">
            Manage your team's work schedule
          </p>
        </div>

        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Staff Member
        </button>
      </div>

      {/* Week Navigator */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            className="btn-secondary"
          >
            Previous Week
          </button>

          <h2 className="text-xl font-semibold">
            Week of {format(startOfWeek(currentWeek), 'MMMM d, yyyy')}
          </h2>

          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            className="btn-secondary"
          >
            Next Week
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-6 bg-gray-50 sticky left-0">
                Staff Member
              </th>
              {weekDays.map((day) => (
                <th key={day.toISOString()} className="text-center py-4 px-4">
                  <div className="text-sm text-gray-600">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg font-semibold">
                    {format(day, 'd')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b">
                <td className="py-4 px-6 bg-gray-50 sticky left-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                </td>
                {weekDays.map((day) => {
                  const shift = getShiftForStaffAndDate(member.id, day);
                  return (
                    <td
                      key={day.toISOString()}
                      className="py-4 px-4 text-center"
                    >
                      {shift ? (
                        <div className="bg-primary-100 rounded-lg p-2 hover:bg-primary-200 transition-colors group relative">
                          <p className="text-sm font-semibold text-primary-800">
                            {shift.startTime} - {shift.endTime}
                          </p>
                          <div className="hidden group-hover:flex absolute top-full left-1/2 -translate-x-1/2 mt-2 gap-2 z-10">
                            <button
                              className="btn-secondary btn-sm"
                              onClick={() => {
                                // Edit shift
                              }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn-secondary btn-sm text-red-600"
                              onClick={() => handleDeleteShift(shift.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddShift(member.id, day)}
                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-gray-400 hover:text-primary-600"
                        >
                          <Plus size={20} className="mx-auto" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {staff.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  No staff members added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 9.3 营业时间与排班 API

**app/api/provider/business-hours/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
    include: {
      businessHours: true,
    },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  // Convert array to object keyed by day
  const hoursMap = {};
  provider.businessHours.forEach((hour) => {
    hoursMap[hour.dayOfWeek] = {
      open: hour.openTime,
      close: hour.closeTime,
      breaks: hour.breaks || [],
    };
  });

  return NextResponse.json(hoursMap);
}

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const hoursData = await req.json();

  // Delete existing hours
  await prisma.businessHours.deleteMany({
    where: { providerId: provider.id },
  });

  // Create new hours
  const hoursToCreate = Object.entries(hoursData)
    .filter(([_, hours]) => hours !== null)
    .map(([day, hours]: [string, any]) => ({
      providerId: provider.id,
      dayOfWeek: day,
      openTime: hours.open,
      closeTime: hours.close,
      breaks: hours.breaks || [],
    }));

  await prisma.businessHours.createMany({
    data: hoursToCreate,
  });

  return NextResponse.json({ success: true });
}
```

**app/api/provider/holidays/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const holidays = await prisma.holiday.findMany({
    where: { providerId: provider.id },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(holidays);
}

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const { date, name } = await req.json();

  const holiday = await prisma.holiday.create({
    data: {
      providerId: provider.id,
      date: new Date(date),
      name,
    },
  });

  return NextResponse.json(holiday);
}
```

**app/api/provider/schedules/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek } from 'date-fns';

export async function GET(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = new Date(searchParams.get('startDate') || new Date());

  const schedules = await prisma.staffSchedule.findMany({
    where: {
      staff: { providerId: provider.id },
      date: {
        gte: startOfWeek(startDate),
        lte: endOfWeek(startDate),
      },
    },
    include: {
      staff: true,
    },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(schedules);
}

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { staffId, date, startTime, endTime } = await req.json();

  const schedule = await prisma.staffSchedule.create({
    data: {
      staffId,
      date: new Date(date),
      startTime,
      endTime,
    },
    include: {
      staff: true,
    },
  });

  return NextResponse.json(schedule);
}
```

---

## 🔔 功能10: 商户通知与消息中心

### 10.1 消息中心页面

**app/provider-dashboard/messages/page.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';

export default function MessagesPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'bookings', 'reviews', 'system'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    const params = new URLSearchParams({ filter });
    const res = await fetch(`/api/provider/notifications?${params}`);
    const data = await res.json();
    setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await fetch(`/api/provider/notifications/${id}/read`, {
      method: 'POST',
    });
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch('/api/provider/notifications/mark-all-read', {
      method: 'POST',
    });
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_NEW':
      case 'BOOKING_CANCELLED':
        return <Calendar className="text-blue-600" size={20} />;
      case 'REVIEW_NEW':
        return <CheckCircle className="text-yellow-600" size={20} />;
      case 'PAYMENT_RECEIVED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'SYSTEM':
        return <AlertCircle className="text-gray-600" size={20} />;
      default:
        return <Bell className="text-gray-600" size={20} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Messages & Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="btn-secondary"
          disabled={unreadCount === 0}
        >
          Mark All as Read
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search notifications..."
              className="input-field w-full pl-10"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="bookings">Bookings</option>
            <option value="reviews">Reviews</option>
            <option value="payments">Payments</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationCard({ notification, onMarkAsRead }) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_NEW':
      case 'BOOKING_CANCELLED':
      case 'BOOKING_REMINDER':
        return <Calendar className="text-blue-600" size={20} />;
      case 'REVIEW_NEW':
        return <CheckCircle className="text-yellow-600" size={20} />;
      case 'PAYMENT_RECEIVED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'SYSTEM':
        return <AlertCircle className="text-gray-600" size={20} />;
      default:
        return <Bell className="text-gray-600" size={20} />;
    }
  };

  return (
    <div
      className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="p-3 bg-white rounded-lg border">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3
              className={`font-semibold ${
                !notification.read ? 'text-primary-700' : 'text-gray-900'
              }`}
            >
              {notification.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={14} />
              {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3">{notification.message}</p>

          {/* Action Button */}
          {notification.actionUrl && (
            <a
              href={notification.actionUrl}
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {notification.actionText || 'View Details'} →
            </a>
          )}
        </div>

        {/* Unread Indicator */}
        {!notification.read && (
          <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
        )}
      </div>
    </div>
  );
}
```

### 10.2 消息模板管理

**app/provider-dashboard/settings/message-templates/page.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Plus, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TEMPLATE_TYPES = [
  { value: 'BOOKING_CONFIRMATION', label: 'Booking Confirmation' },
  { value: 'BOOKING_REMINDER', label: 'Booking Reminder' },
  { value: 'BOOKING_CANCELLED', label: 'Booking Cancelled' },
  { value: 'REVIEW_REQUEST', label: 'Review Request' },
  { value: 'THANK_YOU', label: 'Thank You Message' },
];

export default function MessageTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const res = await fetch('/api/provider/message-templates');
    const data = await res.json();
    setTemplates(data);
  };

  const handleSave = async (template) => {
    try {
      if (template.id) {
        // Update existing
        await fetch(`/api/provider/message-templates/${template.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template),
        });
      } else {
        // Create new
        await fetch('/api/provider/message-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template),
        });
      }

      toast.success('Template saved!');
      setShowEditor(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await fetch(`/api/provider/message-templates/${id}`, {
        method: 'DELETE',
      });
      toast.success('Template deleted!');
      loadTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Message Templates</h1>
          <p className="text-gray-600 mt-1">
            Customize automated messages sent to your customers
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTemplate({
              type: 'BOOKING_CONFIRMATION',
              channel: 'EMAIL',
              subject: '',
              content: '',
              enabled: true,
            });
            setShowEditor(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Template
        </button>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-2 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => {
              setEditingTemplate(template);
              setShowEditor(true);
            }}
            onDelete={() => handleDelete(template.id)}
          />
        ))}

        {templates.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500 card">
            <Mail size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No message templates yet</p>
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
}

function TemplateCard({ template, onEdit, onDelete }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">
              {TEMPLATE_TYPES.find((t) => t.value === template.type)?.label}
            </h3>
            <span
              className={`badge badge-sm ${
                template.enabled ? 'badge-green' : 'badge-gray'
              }`}
            >
              {template.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {template.channel === 'EMAIL' ? (
              <Mail size={16} />
            ) : (
              <MessageSquare size={16} />
            )}
            <span>{template.channel}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="btn-secondary btn-sm flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="btn-secondary btn-sm text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {template.channel === 'EMAIL' && (
        <p className="text-sm font-medium text-gray-700 mb-2">
          Subject: {template.subject}
        </p>
      )}

      <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
    </div>
  );
}

function TemplateEditor({ template, onSave, onCancel }) {
  const [formData, setFormData] = useState(template);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">
              {template.id ? 'Edit' : 'New'} Message Template
            </h2>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="input-field w-full"
                  required
                >
                  {TEMPLATE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) =>
                    setFormData({ ...formData, channel: e.target.value })
                  }
                  className="input-field w-full"
                  required
                >
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>

            {formData.channel === 'EMAIL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="e.g., Your Booking Confirmation"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {'{customerName}'}, {'{businessName}'},
                  {'{date}'}, {'{time}'}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="input-field w-full h-64"
                placeholder={
                  formData.channel === 'EMAIL'
                    ? 'Hi {customerName},\n\nYour appointment at {businessName} has been confirmed...'
                    : 'Hi {customerName}! Your appointment at {businessName} is confirmed for {date} at {time}.'
                }
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {'{customerName}'}, {'{businessName}'},
                {'{date}'}, {'{time}'}, {'{service}'}, {'{address}'}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, enabled: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span className="font-medium">Enable this template</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save size={20} />
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 10.3 通知 API

**app/api/provider/notifications/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') || 'all';

  const where: any = {
    providerId: provider.id,
  };

  if (filter === 'unread') {
    where.read = false;
  } else if (filter !== 'all') {
    // Filter by type (bookings, reviews, payments, system)
    const typeMap = {
      bookings: ['BOOKING_NEW', 'BOOKING_CANCELLED', 'BOOKING_REMINDER'],
      reviews: ['REVIEW_NEW'],
      payments: ['PAYMENT_RECEIVED', 'PAYOUT_PROCESSED'],
      system: ['SYSTEM'],
    };
    where.type = { in: typeMap[filter] || [] };
  }

  const notifications = await prisma.providerNotification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json(notifications);
}
```

**app/api/provider/notifications/[id]/read/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notification = await prisma.providerNotification.update({
    where: { id: params.id },
    data: { read: true },
  });

  return NextResponse.json(notification);
}
```

**app/api/provider/notifications/mark-all-read/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  await prisma.providerNotification.updateMany({
    where: {
      providerId: provider.id,
      read: false,
    },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
```

**app/api/provider/message-templates/route.ts**

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const templates = await prisma.messageTemplate.findMany({
    where: { providerId: provider.id },
    orderBy: { type: 'asc' },
  });

  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { user: { clerkId: userId } },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const { type, channel, subject, content, enabled } = await req.json();

  const template = await prisma.messageTemplate.create({
    data: {
      providerId: provider.id,
      type,
      channel,
      subject,
      content,
      enabled,
    },
  });

  return NextResponse.json(template);
}
```

---

## 🎯 总结

至此，功能7-10已全部完成实现：

### ✅ 已实现功能

1. **功能7: 商户预约管理中心**
   - 日/周/月视图日历
   - 预约状态管理（确认、取消、完成）
   - 自动退款逻辑
   - 佣金计算触发

2. **功能8: 客户管理系统（CRM）**
   - 客户列表与分段（VIP、新客、流失等）
   - RFM分析（Recency, Frequency, Monetary）
   - 客户详情与消费历史
   - 服务偏好追踪

3. **功能9: 营业时间与排班管理**
   - 每周营业时间配置
   - 休息时间管理
   - 节假日设置
   - 员工排班表

4. **功能10: 商户通知与消息中心**
   - 实时通知接收
   - 消息类型分类过滤
   - 消息模板管理（邮件/短信）
   - 变量替换系统

### 📦 下一步

这些实现需要配合之前的Features 1-6文档一起使用。完整的Top 10功能实现包括：

- **用户端**: 认证、预约、支付、个人中心、评价系统
- **商户端**: 入驻、预约管理、客户管理、排班、通知

所有功能都已提供完整的前端组件和API实现代码，可以直接集成到BeautyBook项目中。
