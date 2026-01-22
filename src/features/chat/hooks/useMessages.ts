/**
 * useMessages Hook
 * Fetches and subscribes to messages using Firebase Realtime Database
 */
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { auth } from "@/lib/firebase";
import { handleApiError } from "@/shared/utils";
import {
    isVirtualThreadId,
    sendImageMessage as rtdbSendImageMessage,
    sendTextMessage as rtdbSendTextMessage,
    subscribeToMessagesSnapshot,
    type RtdbMessage,
} from "../services/firebaseRtdb.service";
import { uploadChatImage } from "../services/media.service";
import { useChatStore } from "../store/chatStore";
import type { ChatMessageRecord, MessageType } from "../types";

const STALE_TIME = 10 * 1000;

export const messageKeys = {
  all: ["messages"] as const,
  list: (threadId: string) => [...messageKeys.all, threadId] as const,
};

/**
 * Convert RTDB message to ChatMessageRecord format for UI compatibility
 */
function rtdbMessageToChatRecord(
  msg: RtdbMessage,
  currentUserId?: number,
): ChatMessageRecord {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.legacySenderId ?? 0,
    senderName: msg.senderName,
    senderAvatarUrl: msg.senderAvatarUrl,
    messageType: msg.type,
    content: msg.text,
    imageUrl: msg.imageUrl,
    card: msg.card,
    createdAt: new Date(msg.createdAt).toISOString(),
    isActive: msg.isActive,
    _clientMessageId: msg.clientMessageId,
    _status: "sent",
  };
}

interface MessagesQueryResult {
  data: ChatMessageRecord[];
  isLoading: boolean;
  error?: Error;
}

interface SendMessageInput {
  conversationId: string;
  content: string;
  replyToId?: number;
}

interface SendMessageResult {
  conversationId: string;
  messageId: string;
}

interface SendMessageWithFilesResult {
  conversationId: string;
  messageIds: string[];
  messageId?: string;
}

/**
 * Hook to subscribe to messages in a conversation
 * Uses Firebase RTDB for real-time updates
 */
export function useMessages(
  conversationId: string | undefined,
): MessagesQueryResult {
  const queryClient = useQueryClient();
  const [data, setData] = useState<ChatMessageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const user = useAuthStore((state) => state.user);
  const pendingMessages = useChatStore((state) => state.pendingMessages);

  useEffect(() => {
    if (!conversationId || isVirtualThreadId(conversationId)) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = subscribeToMessagesSnapshot(
      conversationId,
      (rtdbMessages) => {
        const chatRecords = rtdbMessages.map((msg) =>
          rtdbMessageToChatRecord(msg, user?.id),
        );

        const pendingForConversation = Array.from(pendingMessages.values())
          .filter((pm) => pm.conversationId === conversationId)
          .filter(
            (pm) =>
              !chatRecords.some(
                (cr) => cr._clientMessageId === pm.clientMessageId,
              ),
          );

        const pendingRecords: ChatMessageRecord[] = pendingForConversation.map(
          (pm) => ({
            id: pm.clientMessageId,
            conversationId,
            senderId: user?.id ?? 0,
            senderName: user?.displayName,
            senderAvatarUrl: user?.avatarUrl,
            messageType: "text" as MessageType,
            content: pm.content,
            createdAt: new Date(pm.timestamp).toISOString(),
            isActive: true,
            _clientMessageId: pm.clientMessageId,
            _status: pm.status === "error" ? "sending" : pm.status,
            _error: pm.errorMessage,
          }),
        );

        const allMessages = [...chatRecords, ...pendingRecords].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        setData(allMessages);
        setIsLoading(false);

        queryClient.setQueryData(messageKeys.list(conversationId), allMessages);
      },
      (err) => {
        console.error("[useMessages] Error subscribing to messages:", err);
        setError(err);
        setIsLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId, queryClient, user?.id, pendingMessages]);

  return { data, isLoading, error };
}

/**
 * Hook to send a text message
 * Uses Firebase RTDB with optimistic updates
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { addPendingMessage, handleAck } = useChatStore();

  return useMutation<SendMessageResult, Error, SendMessageInput>({
    mutationFn: async ({ conversationId, content, replyToId }) => {
      const user = useAuthStore.getState().user;
      const firebaseUser = auth.currentUser;

      if (!user || !firebaseUser || !conversationId) {
        throw new Error("User not authenticated or missing conversation ID");
      }

      const clientMessageId = `${firebaseUser.uid}_${Date.now()}`;

      addPendingMessage({
        clientMessageId,
        conversationId,
        content: content ?? "",
        replyToId,
      });

      try {
        const message = await rtdbSendTextMessage(
          conversationId,
          content ?? "",
          {
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            legacyUserId: user.id,
          },
          clientMessageId,
        );

        handleAck({
          clientMessageId,
          status: "DELIVERED",
          conversationId,
        });

        return {
          conversationId,
          messageId: message.id,
        };
      } catch (error) {
        handleAck({
          clientMessageId,
          status: "ERROR",
          conversationId,
          errorMessage: (error as Error).message,
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(data.conversationId),
      });
    },
    onError: (error) => {
      handleApiError(error, "G?i tin nh?n");
    },
  });
}

/**
 * Hook to send a message with files (images)
 * Uses Firebase Storage + RTDB
 */
export function useSendMessageWithFiles() {
  const queryClient = useQueryClient();

  return useMutation<
    SendMessageWithFilesResult,
    Error,
    {
      conversationId: string;
      content?: string;
      replyToId?: number;
      files: Array<{ uri: string; name: string; type: string }>;
    }
  >({
    mutationFn: async (data) => {
      const user = useAuthStore.getState().user;
      const firebaseUser = auth.currentUser;

      if (!user || !firebaseUser) {
        throw new Error("User not authenticated");
      }

      if (!data.files || data.files.length === 0) {
        throw new Error("No file selected");
      }

      const messageIds: string[] = [];

      for (const file of data.files) {
        const imageUrl = await uploadChatImage(data.conversationId, file);

        const message = await rtdbSendImageMessage(
          data.conversationId,
          imageUrl,
          data.content,
          {
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            legacyUserId: user.id,
          },
        );

        messageIds.push(message.id);
      }

      return {
        conversationId: data.conversationId,
        messageIds,
        messageId: messageIds[0],
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(data.conversationId),
      });
    },
    onError: (error) => {
      handleApiError(error, "G?i hình ?nh");
    },
  });
}

export function useUpdateMessage() {
  return useMutation({
    mutationFn: async () => {
      throw new Error("Update message is not supported yet");
    },
  });
}

export function useDeleteMessage() {
  return useMutation({
    mutationFn: async () => {
      throw new Error("Delete message is handled via unsend");
    },
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: async () => {
      return;
    },
  });
}

interface SearchResultPage {
  content: ChatMessageRecord[];
}

export function useSearchMessages(
  params: { conversationId: string; keyword: string } | undefined,
) {
  const keyword = params?.keyword?.trim().toLowerCase() ?? "";
  const user = useAuthStore((state) => state.user);

  return useInfiniteQuery<SearchResultPage>({
    queryKey: ["messageSearch", params?.conversationId ?? "", keyword],
    queryFn: async () => {
      if (!params?.conversationId || !keyword) {
        return { content: [] };
      }

      return new Promise<SearchResultPage>((resolve, reject) => {
        const unsubscribe = subscribeToMessagesSnapshot(
          params.conversationId,
          (rtdbMessages) => {
            unsubscribe();

            const filtered = rtdbMessages
              .filter((msg) => msg.isActive !== false)
              .filter((msg) => (msg.text ?? "").toLowerCase().includes(keyword))
              .map((msg) => rtdbMessageToChatRecord(msg, user?.id));

            resolve({ content: filtered });
          },
          (err) => {
            unsubscribe();
            reject(err);
          },
          500,
        );
      });
    },
    initialPageParam: 0,
    getNextPageParam: () => undefined,
    enabled: !!params?.conversationId && keyword.length >= 2,
    staleTime: STALE_TIME,
  });
}
