/**
 * useJoinChannel Hook
 * Mutation hook for joining a channel
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelInfoService } from '../services';

/**
 * Hook to join a channel
 */
export function useJoinChannel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (channelId: string) => channelInfoService.joinChannel(channelId),
        onSuccess: (data) => {
            // Invalidate the channel info query to refetch with updated isJoined status
            queryClient.invalidateQueries({ queryKey: ['channelInfo', data.channelId] });
        },
    });
}

/**
 * Hook to leave a channel
 */
export function useLeaveChannel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (channelId: string) => channelInfoService.leaveChannel(channelId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['channelInfo', data.channelId] });
        },
    });
}
