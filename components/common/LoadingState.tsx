'use client';

import React from 'react';

interface LoadingStateProps {
  /** Custom loading message */
  message?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show full page overlay */
  fullPage?: boolean;
  /** Number of skeleton items to show */
  skeletonCount?: number;
  /** Type of skeleton */
  skeletonType?: 'card' | 'list' | 'text';
}

/**
 * Reusable loading state component
 */
const LoadingState = React.memo(function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullPage = false,
  skeletonCount = 3,
  skeletonType = 'card',
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-pink-200 border-t-pink-500`}
      />
      {message && (
        <p className="text-gray-500 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  if (skeletonType === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (skeletonType === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 bg-white rounded-lg animate-pulse"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-2 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Text skeleton
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-200 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
});

export default LoadingState;
