/**
 * useCreateChannel hook
 * Mutation for creating a new channel
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Href, router } from 'expo-router';

import { createChannel } from '../services/mockCreateChannel';
import { addDynamicGroupThread } from '../services/mockGroupThread';
import type { CreateChannelInput, CreateChannelResponse } from '../types/channel.types';

/**
 * Create channel mutation hook
 * Handles channel creation and navigation
 */
export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation<CreateChannelResponse, Error, CreateChannelInput>({
    mutationFn: createChannel,
    onSuccess: (data, variables) => {
      // Add the new channel to the mock database so it can be fetched
      addDynamicGroupThread(data.channelId, {
        id: data.channelId,
        type: 'group',
        name: variables.name,
        avatarUrl: undefined,
        memberCount: variables.memberIds.length + 1,
        onlineCount: 1,
      });
      
      // Invalidate channels list to refresh
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      
      // Use setTimeout to ensure modal is fully closed before navigation
      // This prevents the "unhandled action" error when navigating from a modal
      setTimeout(() => {
        // Navigate to the new channel thread using imperative API
        // This works better when navigating from modals/bottom sheets
        router.push(`/chat/${data.channelId}` as Href);
      }, 300);
    },
    onError: (error) => {
      console.error('Failed to create channel:', error.message);
    },
  });
}
