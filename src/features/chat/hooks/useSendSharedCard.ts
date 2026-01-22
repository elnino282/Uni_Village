/**
 * useSendSharedCard hook
 * Sends a shared card message (e.g., itinerary) with optimistic updates
 * Uses Firebase RTDB for real-time messaging
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/authStore";
import { auth } from "@/lib/firebase";
import { conversationsApi } from "../api";
import {
    ensureConversation,
    isVirtualThreadId,
    sendSharedCardMessage as rtdbSendSharedCardMessage,
    type ConversationParticipant,
} from "../services/firebaseRtdb.service";
import type { ChatMessageRecord, SharedCard } from "../types";
import { messageKeys } from "./useMessages";

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

  return useMutation<
    ChatMessageRecord,
    Error,
    SendSharedCardInput,
    MutationContext
  >({
    mutationFn: async ({ threadId, card, recipient }) => {
      const user = useAuthStore.getState().user;
      const firebaseUser = auth.currentUser;

      if (!user || !firebaseUser) {
        throw new Error("User not authenticated");
      }

      const senderInfo = {
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        legacyUserId: user.id,
      };

      if (isVirtualThreadId(threadId) && !recipient) {
        throw new Error("Missing recipient info for virtual thread");
      }

      // Create conversation if it's a virtual thread
      let conversationId = threadId;
      if (isVirtualThreadId(threadId) && recipient) {
        if (!recipient.legacyUserId) {
          throw new Error("Missing recipient legacy user ID");
        }

        const response = await conversationsApi.getOrCreateDirect(
          recipient.legacyUserId
        );
        const resolvedId = response.result?.conversationId;
        if (!resolvedId) {
          throw new Error("Failed to resolve conversation ID");
        }

        const currentUserParticipant: ConversationParticipant = {
          uid: firebaseUser.uid,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          legacyUserId: user.id,
        };

        await ensureConversation(resolvedId, {
          type: "dm",
          members: [
            currentUserParticipant,
            {
              uid: recipient.legacyUserId.toString(),
              displayName: recipient.displayName,
              avatarUrl: recipient.avatarUrl,
              legacyUserId: recipient.legacyUserId,
            },
          ],
        });

        conversationId = resolvedId;
      }

      const rtdbMessage = await rtdbSendSharedCardMessage(
        conversationId,
        card,
        senderInfo,
      );

      // Convert to ChatMessageRecord format
      return {
        id: rtdbMessage.id,
        conversationId: rtdbMessage.conversationId,
        senderId: rtdbMessage.legacySenderId ?? user.id,
        senderName: rtdbMessage.senderName,
        senderAvatarUrl: rtdbMessage.senderAvatarUrl,
        messageType: "sharedCard",
        card: rtdbMessage.card,
        createdAt: new Date(rtdbMessage.createdAt).toISOString(),
        isActive: rtdbMessage.isActive,
        _status: "sent",
      };
    },
    onMutate: async ({ threadId, card }) => {
      await queryClient.cancelQueries({ queryKey: messageKeys.list(threadId) });

      const previousMessages = queryClient.getQueryData<ChatMessageRecord[]>(
        messageKeys.list(threadId),
      );

      const user = useAuthStore.getState().user;
      const optimisticMessage: ChatMessageRecord = {
        id: `optimistic_${Date.now()}`,
        conversationId: threadId,
        senderId: user?.id ?? 0,
        senderName: user?.displayName,
        senderAvatarUrl: user?.avatarUrl,
        messageType: "sharedCard",
        card,
        createdAt: new Date().toISOString(),
        isActive: true,
        _status: "sending",
      };

      queryClient.setQueryData<ChatMessageRecord[]>(
        messageKeys.list(threadId),
        (old) => [...(old ?? []), optimisticMessage],
      );

      return { previousMessages, optimisticMessage };
    },
    onError: (_err, { threadId }, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          messageKeys.list(threadId),
          context.previousMessages,
        );
      }
    },
    onSuccess: (newMessage, { threadId }, context) => {
      queryClient.setQueryData<ChatMessageRecord[]>(
        messageKeys.list(threadId),
        (old) =>
          (old ?? []).map((msg) =>
            msg.id === context?.optimisticMessage.id ? newMessage : msg,
          ),
      );
    },
  });
}
