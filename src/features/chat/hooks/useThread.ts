/**
 * useThread hook
 * Fetches chat thread metadata (peer info, online status)
 */
import { useQuery } from '@tanstack/react-query';

import { fetchThread } from '../services';
import type { ChatThread } from '../types';

/**
 * Query key factory for thread queries
 */
export const threadKeys = {
  all: ['threads'] as const,
  detail: (threadId: string) => [...threadKeys.all, threadId] as const,
};

/**
 * Fetch and cache thread info
 * @param threadId - Thread identifier
 */
export function useThread(threadId: string) {
  return useQuery<ChatThread, Error>({
    queryKey: threadKeys.detail(threadId),
    queryFn: async () => {
      const response = await fetchThread(threadId);
      return response.thread;
    },
    enabled: !!threadId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
