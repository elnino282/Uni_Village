/**
 * useChatSubscription hook
 * Subscribe to real-time message events and update React Query cache
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { queryKeys } from '@/config/queryKeys';
import type { MessageEvent, WebSocketMessage } from '@/lib/websocket';
import { websocketService } from '@/lib/websocket';
import type { MessageResponse } from '@/shared/types/backend.types';
import type { Slice } from '@/shared/types/pagination.types';
import { useChatStore } from '../store';

/**
 * Infinite query data structure for messages
 */
interface InfiniteMessagesData {
    pages: Slice<MessageResponse>[];
    pageParams: number[];
}

/**
 * Subscribe to real-time chat events for a conversation
 * Automatically updates React Query cache when receiving SEND, EDIT, UNSEND, SEEN events
 */
export function useChatSubscription(conversationId: string | undefined) {
    const queryClient = useQueryClient();
    const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
    const { user } = useAuthStore();

    const handleMessageEvent = useCallback(
        (wsMessage: WebSocketMessage<MessageEvent>) => {
            if (!conversationId) return;

            const queryKey = queryKeys.messages.list(conversationId, {});

            switch (wsMessage.eventType) {
                case 'SEND': {
                    // Prepend new message to the first page
                    const newMessage = wsMessage.data.message;
                    if (!newMessage) return;

                    // Ignore my own messages (handled by optimistic updates)
                    if (user && newMessage.senderId === Number(user.id)) {
                        return;
                    }

                    queryClient.setQueryData<InfiniteMessagesData>(
                        queryKey,
                        (oldData) => {
                            if (!oldData?.pages?.length) {
                                // No existing data - invalidate to trigger refetch instead of creating fake structure
                                // This avoids type issues with missing pageable/sort fields
                                return undefined;
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
                            };

                            return { ...oldData, pages: newPages };
                        }
                    );

                    // If no existing data, invalidate to trigger fresh fetch
                    const existingData = queryClient.getQueryData<InfiniteMessagesData>(queryKey);
                    if (!existingData) {
                        queryClient.invalidateQueries({ queryKey });
                    }
                    break;
                }

                case 'EDIT': {
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
                                    msg.id === editedMessage.id ? editedMessage : msg
                                ),
                            }));

                            return { ...oldData, pages: newPages };
                        }
                    );
                    break;
                }

                case 'UNSEND': {
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
                                        ? { ...msg, isActive: false, content: '' }
                                        : msg
                                ),
                            }));

                            return { ...oldData, pages: newPages };
                        }
                    );
                    break;
                }

                case 'SEEN': {
                    // Invalidate to refetch with updated readBy
                    queryClient.invalidateQueries({ queryKey });
                    break;
                }

                default:
                    // Other events (TYPING handled separately)
                    break;
            }
        },
        [conversationId, queryClient]
    );

    useEffect(() => {
        if (!conversationId || !websocketService.isConnected()) {
            return;
        }

        // Subscribe to message events
        const subscription = websocketService.subscribeToMessages(
            conversationId,
            handleMessageEvent
        );

        subscriptionRef.current = subscription;

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        };
    }, [conversationId, handleMessageEvent]);

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
        if (conversationId && socketStatus === 'disconnected') {
            websocketService.connect().catch((error) => {
                console.error('[useChatRealtime] Connection failed:', error);
            });
        }
    }, [conversationId, socketStatus]);

    return {
        socketStatus,
        isSubscribed,
        isConnected: socketStatus === 'connected',
        isConnecting: socketStatus === 'connecting',
    };
}
