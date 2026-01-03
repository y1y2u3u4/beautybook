import { ValidationError } from './api-utils';

/**
 * Validation utilities for input data
 */

/**
 * Validate and parse a date string
 * @throws ValidationError if date is invalid
 */
export function validateDate(dateString: string, fieldName: string = 'date'): Date {
  if (!dateString || typeof dateString !== 'string') {
    throw new ValidationError(`${fieldName} is required`);
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new ValidationError(`Invalid ${fieldName} format. Please use ISO 8601 format (YYYY-MM-DD)`);
  }

  return date;
}

/**
 * Validate and parse an integer
 * @throws ValidationError if value is not a valid integer or out of range
 */
export function validateInt(
  value: string | number | undefined,
  fieldName: string,
  options: { min?: number; max?: number; required?: boolean } = {}
): number | undefined {
  const { min, max, required = false } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return undefined;
  }

  const parsed = typeof value === 'number' ? value : parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new ValidationError(`${fieldName} must be a valid integer`);
  }

  if (min !== undefined && parsed < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`);
  }

  return parsed;
}

/**
 * Validate and parse a float
 * @throws ValidationError if value is not a valid number or out of range
 */
export function validateFloat(
  value: string | number | undefined,
  fieldName: string,
  options: { min?: number; max?: number; required?: boolean } = {}
): number | undefined {
  const { min, max, required = false } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return undefined;
  }

  const parsed = typeof value === 'number' ? value : parseFloat(value);

  if (isNaN(parsed)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  if (min !== undefined && parsed < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`);
  }

  return parsed;
}

/**
 * Validate a string
 * @throws ValidationError if string is invalid
 */
export function validateString(
  value: string | undefined,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; required?: boolean; pattern?: RegExp } = {}
): string | undefined {
  const { minLength, maxLength, required = false, pattern } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (minLength !== undefined && trimmed.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`);
  }

  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`);
  }

  if (pattern && !pattern.test(trimmed)) {
    throw new ValidationError(`${fieldName} format is invalid`);
  }

  return trimmed;
}

/**
 * Validate a time string in HH:MM format
 * @throws ValidationError if time format is invalid
 */
export function validateTimeString(
  value: string | undefined,
  fieldName: string = 'time',
  required: boolean = false
): { hours: number; minutes: number } | undefined {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return undefined;
  }

  const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  const match = value.match(timePattern);

  if (!match) {
    throw new ValidationError(`${fieldName} must be in HH:MM format (e.g., 09:30)`);
  }

  return {
    hours: parseInt(match[1], 10),
    minutes: parseInt(match[2], 10),
  };
}

/**
 * Validate an email address
 * @throws ValidationError if email is invalid
 */
export function validateEmail(
  value: string | undefined,
  fieldName: string = 'email',
  required: boolean = false
): string | undefined {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return undefined;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid email address`);
  }

  return value.toLowerCase();
}

/**
 * Validate an enum value
 * @throws ValidationError if value is not in allowed values
 */
export function validateEnum<T extends string>(
  value: string | undefined,
  fieldName: string,
  allowedValues: readonly T[],
  required: boolean = false
): T | undefined {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return undefined;
  }

  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    );
  }

  return value as T;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page?: string | number,
  pageSize?: string | number
): { page: number; pageSize: number; skip: number } {
  const validatedPage = validateInt(page, 'page', { min: 1 }) || 1;
  const validatedPageSize = validateInt(pageSize, 'pageSize', { min: 1, max: 100 }) || 20;

  return {
    page: validatedPage,
    pageSize: validatedPageSize,
    skip: (validatedPage - 1) * validatedPageSize,
  };
}
