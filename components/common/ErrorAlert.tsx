'use client';

import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info, X, RefreshCw } from 'lucide-react';

type AlertType = 'error' | 'warning' | 'info' | 'success';

interface ErrorAlertProps {
  /** Alert type */
  type?: AlertType;
  /** Title text */
  title?: string;
  /** Message text */
  message: string;
  /** Show dismiss button */
  dismissible?: boolean;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry callback */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const alertStyles: Record<AlertType, { bg: string; border: string; text: string; icon: typeof AlertCircle }> = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: Info,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: AlertCircle,
  },
};

/**
 * Reusable alert component for displaying errors, warnings, and info messages
 */
const ErrorAlert = React.memo(function ErrorAlert({
  type = 'error',
  title,
  message,
  dismissible = false,
  onDismiss,
  showRetry = false,
  onRetry,
  className = '',
}: ErrorAlertProps) {
  const styles = alertStyles[type];
  const Icon = styles.icon;

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${styles.text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${styles.text} mb-1`}>{title}</h4>
          )}
          <p className={`${styles.text} text-sm`}>{message}</p>
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className={`mt-2 inline-flex items-center gap-1 text-sm font-medium ${styles.text} hover:underline`}
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`${styles.text} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
});

export default ErrorAlert;
