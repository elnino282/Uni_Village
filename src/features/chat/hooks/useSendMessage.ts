/**
 * useSendMessage hook
 * Sends a message and handles conversation creation for virtual threads
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/store/authStore';
import type { MessageResponse } from '@/shared/types/backend.types';
import type { Slice } from '@/shared/types/pagination.types';
import { conversationsApi, messagesApi } from '../api';
import { 
  isVirtualThreadId, 
  extractUserIdFromVirtualThread 
} from '../services';
import type { SendMessageInput } from '../types';
import { queryKeys } from '@/config/queryKeys';

interface SendMessageResult {
  conversationId: string;
  messageId: number;
  wasVirtual: boolean;
}

/**
 * Send a new message, creating conversation if needed
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuthStore();

  return useMutation<SendMessageResult, Error, SendMessageInput, { previousMessages: unknown }>({
    mutationFn: async ({ threadId, text }) => {
      let conversationId = threadId;
      const wasVirtual = isVirtualThreadId(threadId);

      if (wasVirtual) {
        const userId = extractUserIdFromVirtualThread(threadId);
        if (!userId) {
          throw new Error('Invalid virtual thread ID');
        }

        const response = await conversationsApi.getOrCreateDirect(userId);
        conversationId = response.result.conversationId;
      }

      const messageResponse = await messagesApi.sendMessage({
        content: text,
        ConversationId: conversationId,
      });

      return {
        conversationId,
        messageId: messageResponse.result.id || 0,
        wasVirtual,
      };
    },
    onMutate: async ({ threadId, text }) => {
      // Don't optimize for virtual threads as they don't have a message list yet
      if (isVirtualThreadId(threadId)) {
        return { previousMessages: null };
      }

      const queryKey = queryKeys.messages.list(threadId, {});

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      if (user) {
        const optimisticMessage: MessageResponse = {
          id: Date.now(), // Temporary ID
          content: text,
          senderId: Number(user.id),
          senderName: user.displayName,
          senderAvatarUrl: user.avatarUrl,
          timestamp: new Date().toISOString(),
        };

        queryClient.setQueryData<{ pages: Slice<MessageResponse>[]; pageParams: any[] }>(
          queryKey,
          (old) => {
            if (!old || !old.pages || old.pages.length === 0) {
              return old;
            }

            const newPages = [...old.pages];
            newPages[0] = {
              ...newPages[0],
              content: [optimisticMessage, ...newPages[0].content],
              numberOfElements: (newPages[0].numberOfElements || 0) + 1,
            };

            return {
              ...old,
              pages: newPages,
            };
          }
        );
      }

      return { previousMessages };
    },
    onError: (err, newTodo, context) => {
      if (!isVirtualThreadId(newTodo.threadId) && context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.messages.list(newTodo.threadId, {}),
          context.previousMessages
        );
      }
    },
    onSuccess: (result, variables) => {
      // For normal threads, we want to invalidate to get the real message ID and status
      if (!result.wasVirtual) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.messages.list(result.conversationId, {}),
        });
      }

      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.all 
      });

      // If this was a virtual conversation, navigate to the real conversation
      if (result.wasVirtual && result.conversationId !== variables.threadId) {
        router.replace(`/chat/${result.conversationId}` as any);
      }
    },
  });
}
