import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/config/queryKeys';
import { channelService } from '../services/channels.service';
import type { ChannelsResponse } from '../types/message.types';

/**
 * Hook to fetch channels with search filtering
 */
export function useChannels(
  page = 1,
  limit = 20,
  search?: string
) {
  return useQuery<ChannelsResponse>({
    queryKey: queryKeys.conversations.communityChannels({ page, limit, search }),
    queryFn: () => channelService.getChannels({ page, limit, search }),
  });
}
