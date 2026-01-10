/**
 * useSearchUsers hook
 * Search users by phone number with 300ms debounce
 */
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { searchUsersByPhone } from '../services';
import type { UserPreview } from '../types';

/**
 * Query key factory for user search queries
 */
export const searchUsersKeys = {
  all: ['searchUsers'] as const,
  byQuery: (query: string) => [...searchUsersKeys.all, query] as const,
};

/**
 * Hook to debounce a value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Search users by phone with 300ms debounce
 * @param query - Search query string
 */
export function useSearchUsers(query: string) {
  // Debounce 300ms for all cases as per requirement
  const debouncedQuery = useDebounce(query, 300);

  return useQuery<UserPreview[], Error>({
    queryKey: searchUsersKeys.byQuery(debouncedQuery),
    queryFn: () => searchUsersByPhone(debouncedQuery),
    // Always enabled to show suggestions when query is empty
    staleTime: 30 * 1000, // 30 seconds
  });
}
