/**
 * useSendSharedCard hook
 * Sends a shared card message (e.g., itinerary) with optimistic updates
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/authStore';
import { generateMessageId } from '../services';
import type { ChatMessageRecord, SharedCard } from '../types';
import { messageKeys } from './useMessages';
import { sendSharedCardMessage, ensureDirectConversation, type ConversationParticipant } from '../services';
import { isVirtualThreadId } from '../services';

export interface SendSharedCardInput {
  threadId: string;
  card: SharedCard;
  recipient?: ConversationParticipant;
}

interface MutationContext {
  previousMessages: ChatMessageRecord[] | undefined;
  optimisticMessage: ChatMessageRecord;
}

/**
 * Send a shared card message with optimistic updates
 */
export function useSendSharedCard() {
  const queryClient = useQueryClient();

  return useMutation<ChatMessageRecord, Error, SendSharedCardInput, MutationContext>({
    mutationFn: async ({ threadId, card, recipient }) => {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const sender: ConversationParticipant = {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      };

      if (isVirtualThreadId(threadId) && !recipient) {
        throw new Error('Missing recipient info for virtual thread');
      }

      const conversationId = isVirtualThreadId(threadId)
        ? await ensureDirectConversation(user, recipient as ConversationParticipant)
        : threadId;

      return sendSharedCardMessage(conversationId, sender, card);
    },
    onMutate: async ({ threadId, card }) => {
      await queryClient.cancelQueries({ queryKey: messageKeys.list(threadId) });

      const previousMessages = queryClient.getQueryData<ChatMessageRecord[]>(
        messageKeys.list(threadId)
      );

      const optimisticMessage: ChatMessageRecord = {
        id: generateMessageId(),
        conversationId: threadId,
        senderId: useAuthStore.getState().user?.id ?? 0,
        senderName: useAuthStore.getState().user?.displayName,
        senderAvatarUrl: useAuthStore.getState().user?.avatarUrl,
        messageType: 'sharedCard',
        card,
        createdAt: new Date().toISOString(),
        isActive: true,
        _status: 'sending',
      };

      queryClient.setQueryData<ChatMessageRecord[]>(messageKeys.list(threadId), (old) => [
        optimisticMessage,
        ...(old ?? []),
      ]);

      return { previousMessages, optimisticMessage };
    },
    onError: (_err, { threadId }, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          messageKeys.list(threadId),
          context.previousMessages
        );
      }
    },
    onSuccess: (newMessage, { threadId }, context) => {
      queryClient.setQueryData<ChatMessageRecord[]>(messageKeys.list(threadId), (old) =>
        (old ?? []).map((msg) =>
          msg.id === context?.optimisticMessage.id ? newMessage : msg
        )
      );
    },
  });
}
