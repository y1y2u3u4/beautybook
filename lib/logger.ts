/**
 * Structured logging utility
 * In production, this could be replaced with a proper logging service
 * like Winston, Pino, or a cloud logging service
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Format a log entry for output
 */
function formatLog(entry: LogEntry): string {
  const { level, context, message, data, timestamp } = entry;
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}${dataStr}`;
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  context: string,
  message: string,
  data?: Record<string, unknown>
): LogEntry {
  return {
    level,
    context,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Logger class with structured logging methods
 */
class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Debug level logging - only in development
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (!isDevelopment) return;

    const entry = createLogEntry('debug', this.context, message, data);
    console.debug(formatLog(entry));
  }

  /**
   * Info level logging
   */
  info(message: string, data?: Record<string, unknown>): void {
    const entry = createLogEntry('info', this.context, message, data);
    console.info(formatLog(entry));
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: Record<string, unknown>): void {
    const entry = createLogEntry('warn', this.context, message, data);
    console.warn(formatLog(entry));
  }

  /**
   * Error level logging
   */
  error(message: string, error?: unknown, data?: Record<string, unknown>): void {
    const errorData = error instanceof Error
      ? { errorName: error.name, errorMessage: error.message, ...data }
      : { error: String(error), ...data };

    const entry = createLogEntry('error', this.context, message, errorData);
    console.error(formatLog(entry));

    // In production, you might want to send errors to a monitoring service
    if (isProduction && error instanceof Error) {
      // TODO: Send to error monitoring service (e.g., Sentry)
    }
  }
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Default logger for general use
 */
export const logger = createLogger('App');

export default logger;
