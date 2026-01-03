/**
 * Date and time formatting utilities
 * Centralized formatting to ensure consistency across the application
 */

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return dateObj.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date for display with day of week
 */
export function formatDateWithDay(date: Date | string): string {
  return formatDate(date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a time for display
 */
export function formatTime(time: string | Date): string {
  if (typeof time === 'string') {
    // Handle HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    // Handle ISO string
    const date = new Date(time);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return time;
  }

  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a date and time together
 */
export function formatDateTime(date: Date | string, time?: string): string {
  const dateStr = formatDate(date);
  const timeStr = time ? formatTime(time) : formatTime(date);
  return `${dateStr} at ${timeStr}`;
}

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMins) < 60) {
    if (diffMins === 0) return 'just now';
    if (diffMins > 0) return `in ${diffMins} minute${diffMins === 1 ? '' : 's'}`;
    return `${Math.abs(diffMins)} minute${diffMins === -1 ? '' : 's'} ago`;
  }

  if (Math.abs(diffHours) < 24) {
    if (diffHours > 0) return `in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
    return `${Math.abs(diffHours)} hour${diffHours === -1 ? '' : 's'} ago`;
  }

  if (diffDays > 0) return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  return `${Math.abs(diffDays)} day${diffDays === -1 ? '' : 's'} ago`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format duration in minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (remainingMins === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }

  return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMins} min`;
}

/**
 * Format a phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Get the day of week name
 */
export function getDayOfWeekName(dayIndex: number, format: 'long' | 'short' = 'long'): string {
  const days = {
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };
  return days[format][dayIndex] || '';
}
