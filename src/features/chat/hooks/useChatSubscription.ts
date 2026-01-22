/**
 * useChatSubscription hook
 * Subscribe to real-time message events and update React Query cache
 */
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import { queryKeys } from "@/config/queryKeys";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { MessageEvent, WebSocketMessage } from "@/lib/websocket";
import { websocketService } from "@/lib/websocket";
import type { MessageResponse } from "@/shared/types/backend.types";
import type { Slice } from "@/shared/types/pagination.types";
import { useChatStore, type PendingMessage } from "../store";

/**
 * Infinite query data structure for messages
 */
interface InfiniteMessagesData {
  pages: Slice<MessageResponse>[];
  pageParams: number[];
}

type OptimisticMessage = MessageResponse & {
  _clientMessageId?: string;
  _isOptimistic?: boolean;
};

const ACK_MATCH_WINDOW_MS = 20000;

function getClientMessageIdFromMessage(message: MessageResponse): string | undefined {
  const payload = message as MessageResponse & {
    clientMessageId?: string;
    _clientMessageId?: string;
  };

  return payload.clientMessageId ?? payload._clientMessageId;
}

function findPendingMatchByContent(
  pendingMessages: Map<string, PendingMessage>,
  message: MessageResponse,
  currentUserId?: number,
): string | undefined {
  if (!currentUserId || message.senderId !== currentUserId) {
    return undefined;
  }

  const messageTimestamp = Date.parse(message.timestamp);
  if (!Number.isFinite(messageTimestamp)) {
    return undefined;
  }

  let bestMatch: { clientMessageId: string; delta: number } | null = null;

  pendingMessages.forEach((pending) => {
    if (pending.conversationId && pending.conversationId !== message.conversationId) {
      return;
    }

    if (pending.content !== message.content) {
      return;
    }

    const pendingReplyTo = pending.replyToId ?? null;
    const messageReplyTo = message.replyToId ?? null;
    if (pendingReplyTo !== messageReplyTo) {
      return;
    }

    const delta = Math.abs(pending.timestamp - messageTimestamp);
    if (delta > ACK_MATCH_WINDOW_MS) {
      return;
    }

    if (!bestMatch || delta < bestMatch.delta) {
      bestMatch = { clientMessageId: pending.clientMessageId, delta };
    }
  });

  return bestMatch?.clientMessageId;
}

function dedupePagesById(pages: Slice<MessageResponse>[]) {
  const seen = new Set<number>();

  return pages.map((page) => {
    const filtered = page.content.filter((msg) => {
      if (msg.id == null) return true;
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });

    if (filtered.length === page.content.length) {
      return page;
    }

    return {
      ...page,
      content: filtered,
      numberOfElements: filtered.length,
      empty: filtered.length === 0,
    };
  });
}

/**
 * Creates an empty page structure for messages
 * Used when receiving a message for a conversation not yet in cache
 */
function createEmptyPageStructure(): InfiniteMessagesData {
  return {
    pages: [
      {
        content: [],
        pageable: {
          pageNumber: 0,
          pageSize: 20,
          sort: { sorted: false, unsorted: true, empty: true },
          offset: 0,
          paged: true,
          unpaged: false,
        },
        size: 20,
        number: 0,
        sort: { sorted: false, unsorted: true, empty: true },
        numberOfElements: 0,
        first: true,
        last: false, // Set to false so UI knows there may be more messages
        empty: true,
      },
    ],
    pageParams: [0],
  };
}

/**
 * Subscribe to real-time chat events for a conversation
 * Automatically updates React Query cache when receiving SEND, EDIT, UNSEND, SEEN events
 */
export function useChatSubscription(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Track socket connection status to re-subscribe when connected
  const socketStatus = useChatStore((state) => state.socketStatus);
  const isConnected = socketStatus === "connected";

  const handleMessageEvent = useCallback(
    (wsMessage: WebSocketMessage<MessageEvent>) => {
      if (!conversationId) return;

      const queryKey = queryKeys.messages.list(conversationId, {});

      switch (wsMessage.eventType) {
        case "SEND": {
          // Prepend new message to the first page
          const newMessage = wsMessage.data.message;
          if (!newMessage) return;

          const pendingMessages = useChatStore.getState().pendingMessages;
          const currentUserId = useAuthStore.getState().user?.id;
          const payloadClientMessageId = getClientMessageIdFromMessage(newMessage);
          const matchedClientMessageId =
            (payloadClientMessageId &&
              pendingMessages.has(payloadClientMessageId) &&
              payloadClientMessageId) ||
            findPendingMatchByContent(
              pendingMessages,
              newMessage,
              currentUserId ? Number(currentUserId) : undefined,
            );

          if (matchedClientMessageId) {
            useChatStore.getState().handleAck({
              clientMessageId: matchedClientMessageId,
              status: "DELIVERED",
              conversationId,
            });
          }

          queryClient.setQueryData<InfiniteMessagesData>(
            queryKey,
            (oldData) => {
              // If no existing data, create empty structure and add message
              if (!oldData?.pages?.length) {
                console.log("[ChatSub] No cache data, creating new structure");
                const newData = createEmptyPageStructure();
                newData.pages[0].content = [newMessage];
                newData.pages[0].numberOfElements = 1;
                newData.pages[0].empty = false;
                return newData;
              }

              const resolvedClientMessageId =
                matchedClientMessageId ?? payloadClientMessageId;
              let replaced = false;

              const updatedPages = oldData.pages.map((page) => ({
                ...page,
                content: page.content.map((msg) => {
                  const optimistic = msg as OptimisticMessage;
                  if (
                    resolvedClientMessageId &&
                    optimistic._clientMessageId === resolvedClientMessageId
                  ) {
                    replaced = true;
                    return newMessage;
                  }
                  return msg;
                }),
              }));

              if (replaced) {
                return { ...oldData, pages: dedupePagesById(updatedPages) };
              }

              // Check if message already exists (deduplication)
              const allMessages = oldData.pages.flatMap((p) => p.content);
              if (allMessages.some((m) => m.id === newMessage.id)) {
                return oldData;
              }

              // Prepend to first page
              const newPages = [...oldData.pages];
              newPages[0] = {
                ...newPages[0],
                content: [newMessage, ...newPages[0].content],
                numberOfElements: newPages[0].numberOfElements + 1,
                empty: false,
              };

              return { ...oldData, pages: newPages };
            },
          );
          break;
        }

        case "EDIT": {
          // Update edited message in cache
          const editedMessage = wsMessage.data.message;
          if (!editedMessage) return;

          queryClient.setQueryData<InfiniteMessagesData>(
            queryKey,
            (oldData) => {
              if (!oldData?.pages?.length) return oldData;

              const newPages = oldData.pages.map((page) => ({
                ...page,
                content: page.content.map((msg) =>
                  msg.id === editedMessage.id ? editedMessage : msg,
                ),
              }));

              return { ...oldData, pages: newPages };
            },
          );
          break;
        }

        case "UNSEND": {
          // Mark message as inactive or remove from cache
          const unsendMessage = wsMessage.data.message;
          if (!unsendMessage) return;

          queryClient.setQueryData<InfiniteMessagesData>(
            queryKey,
            (oldData) => {
              if (!oldData?.pages?.length) return oldData;

              const newPages = oldData.pages.map((page) => ({
                ...page,
                content: page.content.map((msg) =>
                  msg.id === unsendMessage.id
                    ? { ...msg, isActive: false, content: "" }
                    : msg,
                ),
              }));

              return { ...oldData, pages: newPages };
            },
          );
          break;
        }

        case "SEEN": {
          const seenMessage = wsMessage.data?.message;
          if (!seenMessage) return;

          queryClient.setQueryData<InfiniteMessagesData>(
            queryKey,
            (oldData) => {
              if (!oldData?.pages?.length) return oldData;

              const newPages = oldData.pages.map((page) => ({
                ...page,
                content: page.content.map((msg) =>
                  msg.id === seenMessage.id ? seenMessage : msg,
                ),
              }));

              return { ...oldData, pages: newPages };
            },
          );
          break;
        }

        default:
          // Other events (TYPING handled separately)
          break;
      }
    },
    [conversationId, queryClient],
  );

  useEffect(() => {
    if (!conversationId || !isConnected) {
      return;
    }

    // Clean up any previous subscription before re-subscribing
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // Subscribe to message events
    const subscription = websocketService.subscribeToMessages(
      conversationId,
      handleMessageEvent,
    );

    subscriptionRef.current = subscription;
    console.log("[ChatSub] Subscribed to conversation:", conversationId);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
        console.log(
          "[ChatSub] Unsubscribed from conversation:",
          conversationId,
        );
      }
    };
  }, [conversationId, isConnected, handleMessageEvent]);

  return {
    isSubscribed: !!subscriptionRef.current,
  };
}

/**
 * Hook to manage real-time connection and subscriptions for a conversation
 * Combines connection management with subscription handling
 */
export function useChatRealtime(conversationId: string | undefined) {
  const socketStatus = useChatStore((state) => state.socketStatus);
  const { isSubscribed } = useChatSubscription(conversationId);

  useEffect(() => {
    // Auto-connect if not connected
    if (conversationId && socketStatus === "disconnected") {
      websocketService.connect().catch((error) => {
        console.error("[useChatRealtime] Connection failed:", error);
      });
    }
  }, [conversationId, socketStatus]);

  return {
    socketStatus,
    isSubscribed,
    isConnected: socketStatus === "connected",
    isConnecting: socketStatus === "connecting",
  };
}
