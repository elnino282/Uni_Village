import { useQuery } from '@tanstack/react-query';

import { inboxService } from '../services/inbox.service';
import type { ConversationsResponse } from '../types/message.types';

const CONVERSATIONS_KEY = ['community', 'conversations'];

/**
 * Hook to fetch inbox conversations with search filtering
 */
export function useConversations(
  page = 1,
  limit = 20,
  search?: string
) {
  return useQuery<ConversationsResponse>({
    queryKey: [...CONVERSATIONS_KEY, { page, limit, search }],
    queryFn: () => inboxService.getConversations({ page, limit, search }),
  });
}
