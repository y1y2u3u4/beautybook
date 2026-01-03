'use client';

import React from 'react';
import { Calendar, Heart, Search, FileText, Users, Star, Package } from 'lucide-react';

type IconType = 'calendar' | 'heart' | 'search' | 'document' | 'users' | 'star' | 'package' | 'default';

interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Icon type to display */
  icon?: IconType;
  /** Action button text */
  actionText?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Custom icon component */
  customIcon?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const iconMap = {
  calendar: Calendar,
  heart: Heart,
  search: Search,
  document: FileText,
  users: Users,
  star: Star,
  package: Package,
  default: FileText,
};

/**
 * Reusable empty state component for when there's no data to display
 */
const EmptyState = React.memo(function EmptyState({
  title,
  description,
  icon = 'default',
  actionText,
  onAction,
  customIcon,
  size = 'md',
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-10 w-10',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'h-14 w-14',
      title: 'text-lg',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'h-20 w-20',
      title: 'text-xl',
      description: 'text-lg',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${classes.container}`}>
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        {customIcon || <Icon className={`${classes.icon} text-gray-400`} />}
      </div>
      <h3 className={`font-semibold text-gray-700 mb-2 ${classes.title}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-gray-500 max-w-md mb-4 ${classes.description}`}>
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors font-medium"
        >
          {actionText}
        </button>
      )}
    </div>
  );
});

export default EmptyState;
