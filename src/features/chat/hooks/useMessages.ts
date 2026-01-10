/**
 * useMessages hook
 * Fetches messages for a chat thread
 */
import { useQuery } from '@tanstack/react-query';

import { fetchMessages } from '../services';
import type { Message } from '../types';

/**
 * Query key factory for message queries
 */
export const messageKeys = {
  all: ['messages'] as const,
  list: (threadId: string) => [...messageKeys.all, 'list', threadId] as const,
};

/**
 * Fetch and cache messages for a thread
 * @param threadId - Thread identifier
 */
export function useMessages(threadId: string) {
  return useQuery<Message[], Error>({
    queryKey: messageKeys.list(threadId),
    queryFn: async () => {
      const response = await fetchMessages(threadId);
      return response.messages;
    },
    enabled: !!threadId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
