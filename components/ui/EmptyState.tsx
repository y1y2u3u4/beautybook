'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Search,
  Users,
  ShoppingBag,
  Star,
  Bell,
  FileText,
  Settings,
  Sparkles,
} from 'lucide-react';

type EmptyStateType =
  | 'appointments'
  | 'search'
  | 'customers'
  | 'services'
  | 'reviews'
  | 'notifications'
  | 'staff'
  | 'general';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children?: ReactNode;
}

const emptyStateConfig: Record<
  EmptyStateType,
  { icon: ReactNode; defaultTitle: string; defaultDescription: string }
> = {
  appointments: {
    icon: <Calendar className="w-16 h-16" />,
    defaultTitle: 'No appointments yet',
    defaultDescription:
      'You don\'t have any appointments scheduled. Book your first appointment to get started!',
  },
  search: {
    icon: <Search className="w-16 h-16" />,
    defaultTitle: 'No results found',
    defaultDescription:
      'We couldn\'t find any providers matching your search. Try adjusting your filters or search terms.',
  },
  customers: {
    icon: <Users className="w-16 h-16" />,
    defaultTitle: 'No customers yet',
    defaultDescription:
      'Your customer list is empty. Customers will appear here once they book appointments.',
  },
  services: {
    icon: <ShoppingBag className="w-16 h-16" />,
    defaultTitle: 'No services added',
    defaultDescription:
      'Add your first service to start accepting bookings from customers.',
  },
  reviews: {
    icon: <Star className="w-16 h-16" />,
    defaultTitle: 'No reviews yet',
    defaultDescription:
      'You haven\'t received any reviews yet. Great service leads to great reviews!',
  },
  notifications: {
    icon: <Bell className="w-16 h-16" />,
    defaultTitle: 'All caught up!',
    defaultDescription:
      'You have no new notifications. We\'ll let you know when something needs your attention.',
  },
  staff: {
    icon: <Users className="w-16 h-16" />,
    defaultTitle: 'No team members',
    defaultDescription:
      'Add your first staff member to start managing your team.',
  },
  general: {
    icon: <FileText className="w-16 h-16" />,
    defaultTitle: 'Nothing here yet',
    defaultDescription:
      'This section is empty. Content will appear here when available.',
  },
};

export default function EmptyState({
  type,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Decorative background */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full blur-2xl opacity-50 scale-150" />
        <div className="relative w-32 h-32 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-full flex items-center justify-center border border-primary-100">
          <div className="text-primary-400">{config.icon}</div>
        </div>

        {/* Floating decorations */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center border border-accent-200 animate-float">
          <Sparkles className="w-4 h-4 text-accent-500" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-neutral-900 mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-neutral-600 max-w-md mb-6">
        {description || config.defaultDescription}
      </p>

      {/* Action button */}
      {action && (
        action.href ? (
          <Link href={action.href} className="btn-primary">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="btn-primary">
            {action.label}
          </button>
        )
      )}

      {/* Custom children */}
      {children}
    </div>
  );
}
