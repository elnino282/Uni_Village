/**
 * useMessages hook
 * Fetches messages for a chat thread (DM or Group)
 */
import { useQuery } from '@tanstack/react-query';

import { fetchGroupMessages, fetchMessages, isGroupThreadId } from '../services';
import type { Message } from '../types';

/**
 * Query key factory for message queries
 */
export const messageKeys = {
  all: ['messages'] as const,
  list: (threadId: string) => [...messageKeys.all, 'list', threadId] as const,
};

/**
 * Fetch and cache messages for a thread (DM or Group)
 * @param threadId - Thread identifier
 */
export function useMessages(threadId: string) {
  return useQuery<Message[], Error>({
    queryKey: messageKeys.list(threadId),
    queryFn: async () => {
      // Check if it's a group thread
      if (isGroupThreadId(threadId)) {
        const response = await fetchGroupMessages(threadId);
        return response.messages;
      }
      
      // DM thread
      const response = await fetchMessages(threadId);
      return response.messages;
    },
    enabled: !!threadId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
