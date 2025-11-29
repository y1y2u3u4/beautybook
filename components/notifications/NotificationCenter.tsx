'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Gift,
  Star,
  Clock,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Trash2,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

export interface Notification {
  id: string;
  type: 'appointment' | 'reminder' | 'promotion' | 'review' | 'reward' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, string>;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Appointment Tomorrow',
    message: 'Your facial treatment with Sarah Johnson is tomorrow at 2:00 PM',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    isRead: false,
    actionUrl: '/customer/appointments',
    actionLabel: 'View Details',
  },
  {
    id: '2',
    type: 'reward',
    title: 'Points Earned!',
    message: 'You earned 150 points from your last booking',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    actionUrl: '/customer/rewards',
    actionLabel: 'View Rewards',
  },
  {
    id: '3',
    type: 'promotion',
    title: '20% Off This Weekend',
    message: 'Book any service this weekend and get 20% off!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    actionUrl: '/providers',
    actionLabel: 'Book Now',
  },
  {
    id: '4',
    type: 'review',
    title: 'Leave a Review',
    message: 'How was your hair styling with Michael Chen?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    isRead: true,
    actionUrl: '/customer/appointments?review=true',
    actionLabel: 'Write Review',
  },
  {
    id: '5',
    type: 'appointment',
    title: 'Booking Confirmed',
    message: 'Your massage therapy appointment has been confirmed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    isRead: true,
  },
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5" />;
      case 'reminder':
        return <Clock className="w-5 h-5" />;
      case 'promotion':
        return <Gift className="w-5 h-5" />;
      case 'review':
        return <Star className="w-5 h-5" />;
      case 'reward':
        return <Sparkles className="w-5 h-5" />;
      case 'system':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-100 text-blue-600';
      case 'reminder':
        return 'bg-amber-100 text-amber-600';
      case 'promotion':
        return 'bg-pink-100 text-pink-600';
      case 'review':
        return 'bg-yellow-100 text-yellow-600';
      case 'reward':
        return 'bg-purple-100 text-purple-600';
      case 'system':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[100]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-neutral-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">All caught up!</h3>
              <p className="text-sm text-neutral-500">
                {filter === 'unread'
                  ? 'No unread notifications'
                  : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-neutral-50 transition-colors ${
                    !notification.isRead ? 'bg-primary-50/30' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      getNotificationColor(notification.type)
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-medium ${
                          notification.isRead ? 'text-neutral-700' : 'text-neutral-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-neutral-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-neutral-600 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>

                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {notification.actionLabel || 'View'}
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200">
          <Link
            href="/customer/notifications/settings"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Notification Settings
          </Link>
        </div>
      </div>
    </>
  );
}

// Export NotificationBell component
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount] = useState(2); // Mock unread count

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-neutral-100 rounded-xl transition-colors"
        aria-label="Open notifications"
      >
        <Bell className="w-6 h-6 text-neutral-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
