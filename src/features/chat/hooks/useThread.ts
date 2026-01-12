/**
 * useThread hook
 * Fetches chat thread metadata (peer info, online status) for DM or Group
 */
import { useQuery } from '@tanstack/react-query';

import { fetchGroupThread, fetchThread, isGroupThreadId } from '../services';
import type { Thread } from '../types';

/**
 * Query key factory for thread queries
 */
export const threadKeys = {
  all: ['threads'] as const,
  detail: (threadId: string) => [...threadKeys.all, threadId] as const,
};

/**
 * Fetch and cache thread info (DM or Group)
 * @param threadId - Thread identifier
 */
export function useThread(threadId: string) {
  return useQuery<Thread, Error>({
    queryKey: threadKeys.detail(threadId),
    queryFn: async () => {
      // Check if it's a group thread
      if (isGroupThreadId(threadId)) {
        const response = await fetchGroupThread(threadId);
        if (response) {
          return response.thread;
        }
        throw new Error('Group thread not found');
      }
      
      // DM thread
      const response = await fetchThread(threadId);
      return response.thread;
    },
    enabled: !!threadId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
