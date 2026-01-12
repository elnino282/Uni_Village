/**
 * useChannelInfo Hook
 * Fetches channel information using React Query
 */

import { useQuery } from '@tanstack/react-query';

import type { ChannelInfo } from '@/shared/types';
import { channelInfoService } from '../services';

const CHANNEL_INFO_KEY = 'channelInfo';

/**
 * Hook to fetch channel info by ID
 */
export function useChannelInfo(channelId: string) {
    return useQuery<ChannelInfo | null>({
        queryKey: [CHANNEL_INFO_KEY, channelId],
        queryFn: () => channelInfoService.getChannelInfo(channelId),
        enabled: !!channelId,
    });
}
