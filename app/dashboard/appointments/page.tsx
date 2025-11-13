'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, MapPin, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  amount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  service: {
    id: string;
    name: string;
    description: string;
    duration: number;
  };
  provider: {
    id: string;
    businessName: string;
    address: string;
    city: string;
    state: string;
    user: {
      imageUrl: string | null;
    };
  };
}

const statusColors = {
  SCHEDULED: 'text-blue-600 bg-blue-100',
  CONFIRMED: 'text-green-600 bg-green-100',
  COMPLETED: 'text-neutral-600 bg-neutral-100',
  CANCELLED: 'text-red-600 bg-red-100',
  NO_SHOW: 'text-orange-600 bg-orange-100',
};

const statusLabels = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/appointments');

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `预约已取消\n\n退款信息：\n- 退款金额：$${data.refund.amount.toFixed(2)} (${data.refund.percentage}%)\n- 原因：${data.refund.reason}\n\n退款将在5-7个工作日内到账。`
        );
        await fetchAppointments();
        setCancellingId(null);
        setCancelReason('');
      } else {
        alert(data.error || '取消预约失败');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('取消预约失败，请稍后重试');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') {
      return aptDate >= today && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED';
    } else if (filter === 'past') {
      return aptDate < today || apt.status === 'COMPLETED' || apt.status === 'CANCELLED';
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">My Appointments</h1>
        <Link href="/providers" className="btn-primary">
          Book New
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'past'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          Past
        </button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">No appointments found</h3>
          <p className="text-neutral-500 mb-6">
            {filter === 'upcoming'
              ? "You don't have any upcoming appointments"
              : filter === 'past'
              ? "You don't have any past appointments"
              : "You haven't booked any appointments yet"}
          </p>
          <Link href="/providers" className="btn-primary inline-block">
            Find a Provider
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Provider Image */}
                <div className="relative w-full md:w-32 h-32 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                  {appointment.provider.user.imageUrl ? (
                    <Image
                      src={appointment.provider.user.imageUrl}
                      alt={appointment.provider.businessName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
                      <span className="text-3xl font-bold text-white">
                        {appointment.provider.businessName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Appointment Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-1">
                        {appointment.service.name}
                      </h3>
                      <p className="text-neutral-600">
                        with {appointment.provider.businessName}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[appointment.status]
                      }`}
                    >
                      {statusLabels[appointment.status]}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Calendar className="w-5 h-5" />
                      <span>
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Clock className="w-5 h-5" />
                      <span>
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <MapPin className="w-5 h-5" />
                      <span>
                        {appointment.provider.city}, {appointment.provider.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <span className="font-semibold text-neutral-900">
                        {formatCurrency(appointment.amount)}
                      </span>
                      <span className="text-sm">
                        • {appointment.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      href={`/providers/${appointment.provider.id}`}
                      className="btn-secondary text-sm"
                    >
                      View Provider
                    </Link>
                    {appointment.status === 'CONFIRMED' || appointment.status === 'SCHEDULED' ? (
                      <>
                        <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium text-sm transition-colors">
                          Reschedule
                        </button>
                        <button
                          onClick={() => setCancellingId(appointment.id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : appointment.status === 'COMPLETED' ? (
                      <button className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg font-medium text-sm transition-colors">
                        Leave Review
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">取消预约</h2>
            <p className="text-neutral-600 mb-6">
              确定要取消此预约吗？根据取消时间，我们将按照以下政策退款：
            </p>

            <div className="bg-neutral-50 p-4 rounded-lg mb-6">
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• 24小时前取消：全额退款</li>
                <li>• 24小时内取消：退款50%</li>
                <li>• 2小时内取消：不予退款</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                取消原因（可选）
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="请告诉我们取消的原因..."
                rows={3}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCancellingId(null);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
              >
                不取消
              </button>
              <button
                onClick={() => handleCancelAppointment(cancellingId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
