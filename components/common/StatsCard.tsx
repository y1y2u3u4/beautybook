'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Change percentage (positive or negative) */
  change?: number;
  /** Change period description */
  changePeriod?: string;
  /** Icon component to display */
  icon?: React.ReactNode;
  /** Icon background color class */
  iconBgColor?: string;
  /** Whether the card is in loading state */
  loading?: boolean;
  /** Format value as currency */
  isCurrency?: boolean;
  /** Additional description */
  description?: string;
}

/**
 * Reusable stats card component for dashboards
 */
const StatsCard = React.memo(function StatsCard({
  title,
  value,
  change,
  changePeriod = 'vs last month',
  icon,
  iconBgColor = 'bg-pink-100',
  loading = false,
  isCurrency = false,
  description,
}: StatsCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (isCurrency) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      }
      return new Intl.NumberFormat('en-US').format(val);
    }
    return val;
  };

  const getChangeInfo = () => {
    if (change === undefined || change === null) return null;

    if (change > 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        prefix: '+',
      };
    } else if (change < 0) {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        prefix: '',
      };
    }
    return {
      icon: Minus,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      prefix: '',
    };
  };

  const changeInfo = getChangeInfo();

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatValue(value)}
          </p>
          {changeInfo && (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${changeInfo.bgColor} ${changeInfo.color}`}
              >
                <changeInfo.icon className="h-3 w-3" />
                {changeInfo.prefix}{Math.abs(change!)}%
              </span>
              <span className="text-gray-400 text-xs">{changePeriod}</span>
            </div>
          )}
          {description && !changeInfo && (
            <p className="text-gray-400 text-sm">{description}</p>
          )}
        </div>
        {icon && (
          <div className={`${iconBgColor} p-3 rounded-xl`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
});

export default StatsCard;
