/**
 * useCreateChannel hook
 * Mutation for creating a new channel using the real API
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Href, router } from 'expo-router';

import { channelsApi, type CreateChannelFormData } from '../api';
import type { CreateChannelInput, CreateChannelResponse } from '../types/channel.types';
import { ChannelPrivacy } from '@/shared/types/backend.types';

/**
 * Create channel mutation hook
 * Handles channel creation and navigation
 */
export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation<CreateChannelResponse, Error, CreateChannelInput>({
    mutationFn: async (input) => {
      const participantIds = input.memberIds
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id));

      const formData: CreateChannelFormData = {
        name: input.name,
        description: input.description,
        privacy: input.isPrivate ? ChannelPrivacy.PRIVATE : ChannelPrivacy.PUBLIC,
        participantIds,
      };

      const response = await channelsApi.createChannel(formData);
      const channel = response.result;

      if (!channel) {
        throw new Error('Failed to create channel');
      }

      return {
        success: true,
        channelId: channel.conversationId || '',
        channel: {
          id: String(channel.id ?? ''),
          name: channel.name || input.name,
          avatarUrl: channel.avatarUrl,
          memberCount: channel.memberCount || participantIds.length + 1,
          category: input.category,
        },
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      setTimeout(() => {
        router.push(`/chat/${data.channelId}` as Href);
      }, 300);
    },
    onError: (error) => {
      console.error('Failed to create channel:', error.message);
    },
  });
}
