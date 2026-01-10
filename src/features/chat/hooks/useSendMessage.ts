/**
 * useSendMessage hook
 * Optimistically sends a message and updates the cache
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateMessageId, getCurrentTimeLabel } from '../services';
import type { Message, SendMessageInput, TextMessage } from '../types';
import { messageKeys } from './useMessages';

/**
 * Creates a new outgoing text message
 */
function createOutgoingMessage(text: string): TextMessage {
  return {
    id: generateMessageId(),
    type: 'text',
    sender: 'me',
    text,
    createdAt: new Date().toISOString(),
    timeLabel: getCurrentTimeLabel(),
    status: 'sent',
  };
}

interface MutationContext {
  previousMessages: Message[] | undefined;
  optimisticMessage: TextMessage;
}

/**
 * Send a new message with optimistic updates
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<TextMessage, Error, SendMessageInput, MutationContext>({
    mutationFn: async ({ text }) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 200));
      return createOutgoingMessage(text);
    },
    onMutate: async ({ threadId, text }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: messageKeys.list(threadId) });

      // Snapshot previous messages
      const previousMessages = queryClient.getQueryData<Message[]>(
        messageKeys.list(threadId)
      );

      // Optimistically add new message
      const optimisticMessage = createOutgoingMessage(text);
      queryClient.setQueryData<Message[]>(messageKeys.list(threadId), (old) => [
        ...(old ?? []),
        optimisticMessage,
      ]);

      return { previousMessages, optimisticMessage };
    },
    onError: (_err, { threadId }, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          messageKeys.list(threadId),
          context.previousMessages
        );
      }
    },
    onSuccess: (newMessage, { threadId }, context) => {
      // Update the optimistic message with the real one
      queryClient.setQueryData<Message[]>(messageKeys.list(threadId), (old) =>
        (old ?? []).map((msg) =>
          msg.id === context?.optimisticMessage.id ? newMessage : msg
        )
      );
    },
  });
}
