import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataFetchOptions {
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial retry delay in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Whether to fetch immediately on mount (default: true) */
  immediate?: boolean;
}

interface UseDataFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
  canRetry: boolean;
}

/**
 * Custom hook for data fetching with timeout, retry, and error handling
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchOptions = {}
): UseDataFetchResult<T> {
  const {
    timeout = 30000,
    maxRetries = 3,
    retryDelay = 1000,
    immediate = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoading(true);
    setError(null);

    // Create timeout
    const timeoutId = setTimeout(() => {
      currentController.abort();
    }, timeout);

    try {
      const result = await fetchFn();

      if (isMountedRef.current && !currentController.signal.aborted) {
        setData(result);
        setError(null);
        setRetryCount(0);
      }
    } catch (err) {
      if (isMountedRef.current && !currentController.signal.aborted) {
        const error = err instanceof Error ? err : new Error('An error occurred');

        // Check if it's a timeout
        if (error.name === 'AbortError') {
          setError(new Error('Request timeout. Please try again.'));
        } else {
          setError(error);
        }
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, timeout]);

  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) return;

    // Exponential backoff
    const delay = retryDelay * Math.pow(2, retryCount);
    await new Promise(resolve => setTimeout(resolve, delay));

    setRetryCount(prev => prev + 1);
    await fetchData();
  }, [retryCount, maxRetries, retryDelay, fetchData]);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    retry,
    canRetry: retryCount < maxRetries,
  };
}

/**
 * Custom hook for optimistic updates
 */
export function useOptimisticUpdate<T, R>(
  updateFn: (data: T) => Promise<R>
): {
  execute: (
    data: T,
    optimisticUpdate: () => void,
    rollback: () => void
  ) => Promise<R | null>;
  loading: boolean;
  error: Error | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      data: T,
      optimisticUpdate: () => void,
      rollback: () => void
    ): Promise<R | null> => {
      setLoading(true);
      setError(null);

      // Apply optimistic update immediately
      optimisticUpdate();

      try {
        const result = await updateFn(data);
        return result;
      } catch (err) {
        // Rollback on error
        rollback();
        const error = err instanceof Error ? err : new Error('Update failed');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [updateFn]
  );

  return { execute, loading, error };
}

export default useDataFetch;
