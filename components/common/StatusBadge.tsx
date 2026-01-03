'use client';

import React from 'react';

type StatusType =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed'
  | 'active'
  | 'inactive'
  | 'verified'
  | 'draft'
  | 'sent';

interface StatusBadgeProps {
  /** Status value */
  status: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show dot indicator */
  showDot?: boolean;
}

const statusStyles: Record<StatusType, { bg: string; text: string; dot: string }> = {
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  no_show: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  paid: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  refunded: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  verified: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  sent: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

/**
 * Reusable status badge component
 */
const StatusBadge = React.memo(function StatusBadge({
  status,
  size = 'md',
  showDot = true,
}: StatusBadgeProps) {
  // Normalize status to lowercase and handle underscore conversion
  const normalizedStatus = status.toLowerCase().replace(/-/g, '_') as StatusType;
  const styles = statusStyles[normalizedStatus] || statusStyles.pending;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  // Format display text
  const displayText = status
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${styles.bg} ${styles.text} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span className={`${dotSizes[size]} rounded-full ${styles.dot}`} />
      )}
      {displayText}
    </span>
  );
});

export default StatusBadge;
