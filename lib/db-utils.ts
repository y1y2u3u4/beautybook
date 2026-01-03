import { prisma } from './prisma';

/**
 * Check if the database is available
 * This is a shared utility to avoid code duplication across API routes
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute a database operation with fallback to mock data
 * @param operation - The database operation to execute
 * @param fallback - The fallback value if database is unavailable
 * @returns The result of the operation or fallback
 */
export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<{ data: T; source: 'database' | 'mock' }> {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return { data: fallback, source: 'mock' };
  }

  try {
    const data = await operation();
    return { data, source: 'database' };
  } catch {
    return { data: fallback, source: 'mock' };
  }
}
