'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, ArrowLeft, Calendar, AlertCircle, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { mockNotifications } from '@/lib/mock-data';

export default function NotificationsDemo() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'all') return true;
    const typeMap: Record<string, string[]> = {
      bookings: ['BOOKING_NEW', 'BOOKING_CANCELLED', 'BOOKING_REMINDER'],
      reviews: ['REVIEW_NEW'],
      payments: ['PAYMENT_RECEIVED'],
      system: ['SYSTEM'],
    };
    return typeMap[filter]?.includes(notif.type);
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Messages & Notifications</h1>
                <p className="text-sm text-gray-600">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button onClick={markAllAsRead} className="btn-secondary" disabled={unreadCount === 0}>
              Mark All as Read
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
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

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
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
    </div>
  );
}

function NotificationCard({ notification, onMarkAsRead }: {
  notification: any;
  onMarkAsRead: (id: string) => void;
}) {
  const getIcon = (type: string) => {
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
        <div className="p-3 bg-white rounded-lg border">{getIcon(notification.type)}</div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3
              className={`font-semibold ${
                !notification.read ? 'text-purple-700' : 'text-gray-900'
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

          {notification.actionUrl && (
            <a
              href={notification.actionUrl}
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {notification.actionText || 'View Details'} →
            </a>
          )}
        </div>

        {!notification.read && <div className="w-3 h-3 bg-purple-600 rounded-full"></div>}
      </div>
    </div>
  );
}
