/**
 * usePublicProfile Hook
 */

import { useQuery } from '@tanstack/react-query';

import { fetchPublicProfile } from '../services';
import type { PublicProfile } from '../types';

export const publicProfileKeys = {
  all: ['publicProfile'] as const,
  detail: (userId: string) => [...publicProfileKeys.all, userId] as const,
};

export function usePublicProfile(userId?: string) {
  return useQuery<PublicProfile, Error>({
    queryKey: userId ? publicProfileKeys.detail(userId) : publicProfileKeys.all,
    queryFn: () => fetchPublicProfile(userId ?? ''),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
