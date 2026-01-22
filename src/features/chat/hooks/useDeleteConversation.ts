/**
 * useDeleteConversation Hook
 * Handles conversation deletion with proper cache invalidation
 * and navigation. Uses optimistic update for immediate UI feedback.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { handleApiError, showSuccessToast } from '@/shared/utils';
import type { ChatMessageRecord } from '../types';
import { leaveConversation } from '../services';
import { messageKeys } from './useMessages';

interface UseDeleteConversationOptions {
  /** Whether to navigate to community tab after deletion. Default: true */
  navigateAfterDelete?: boolean;
}

interface DeleteMutationContext {
  previousMessages: ChatMessageRecord[] | undefined;
}

export function useDeleteConversation(options?: UseDeleteConversationOptions) {
  const { navigateAfterDelete = true } = options ?? {};
  const queryClient = useQueryClient();
  const router = useRouter();

  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      await leaveConversation(conversationId);
    },
    onMutate: async (conversationId): Promise<DeleteMutationContext> => {
      const previousMessages = queryClient.getQueryData<ChatMessageRecord[]>(
        messageKeys.list(conversationId)
      );

      queryClient.setQueryData<ChatMessageRecord[]>(messageKeys.list(conversationId), []);

      return { previousMessages };
    },
    onSuccess: (_, conversationId) => {
      queryClient.removeQueries({ queryKey: messageKeys.list(conversationId) });

      showSuccessToast('Ðã xóa cu?c h?i tho?i');

      if (navigateAfterDelete) {
        router.replace('/(tabs)/community');
      }
    },
    onError: (error, conversationId, context) => {
      console.error('[useDeleteConversation] Delete failed:', error);

      if (context?.previousMessages) {
        queryClient.setQueryData(
          messageKeys.list(conversationId),
          context.previousMessages
        );
      }

      handleApiError(error, 'Xóa cu?c h?i tho?i');
    },
  });

  return {
    deleteConversation,
    isDeleting: deleteConversation.isPending,
  };
}
