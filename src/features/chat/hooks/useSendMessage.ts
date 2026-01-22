/**
 * useSendMessage hook
 * Sends a message using Firebase
 */
import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/authStore';
import type { MessageRequest } from '@/shared/types/backend.types';
import { sendTextMessage, type ConversationParticipant } from '../services';

interface SendMessageResult {
  conversationId: string;
  messageId: string;
}

export function useSendMessage() {
  return useMutation<SendMessageResult, Error, MessageRequest>({
    mutationFn: async ({ ConversationId, content }) => {
      const user = useAuthStore.getState().user;
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      const sender: ConversationParticipant = {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      };

      const message = await sendTextMessage(ConversationId, sender, content ?? '');

      return {
        conversationId: ConversationId,
        messageId: message.id,
      };
    },
  });
}
