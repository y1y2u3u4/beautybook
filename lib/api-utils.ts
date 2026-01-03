import { NextResponse } from 'next/server';

/**
 * Standard API error response type
 */
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string>;
}

/**
 * Standard API success response type
 */
export interface ApiSuccess<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    source?: 'database' | 'mock';
  };
}

/**
 * Error codes for API responses
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

/**
 * Create a standardized error response
 * Hides internal error details in production
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string,
  details?: Record<string, string>
): NextResponse<ApiError> {
  const response: ApiError = {
    error: message,
  };

  if (code) {
    response.code = code;
  }

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiSuccess<T>['meta']
): NextResponse<ApiSuccess<T>> {
  const response: ApiSuccess<T> = { data };

  if (meta) {
    response.meta = meta;
  }

  return NextResponse.json(response);
}

/**
 * Handle API errors safely
 * Logs the full error but returns a safe message to the client
 */
export function handleApiError(
  error: unknown,
  context: string = 'API'
): NextResponse<ApiError> {
  // Log the full error for debugging
  console.error(`[${context}] Error:`, error);

  // Determine error type and return appropriate response
  if (error instanceof ValidationError) {
    return createErrorResponse(
      error.message,
      400,
      ErrorCodes.VALIDATION_ERROR,
      error.details
    );
  }

  if (error instanceof NotFoundError) {
    return createErrorResponse(
      error.message,
      404,
      ErrorCodes.NOT_FOUND
    );
  }

  if (error instanceof UnauthorizedError) {
    return createErrorResponse(
      error.message,
      401,
      ErrorCodes.UNAUTHORIZED
    );
  }

  if (error instanceof ForbiddenError) {
    return createErrorResponse(
      error.message,
      403,
      ErrorCodes.FORBIDDEN
    );
  }

  // For unknown errors, return a generic message
  // Don't expose internal error details
  return createErrorResponse(
    'An unexpected error occurred. Please try again later.',
    500,
    ErrorCodes.INTERNAL_ERROR
  );
}

/**
 * Custom error classes for better error handling
 */
export class ValidationError extends Error {
  details?: Record<string, string>;

  constructor(message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
