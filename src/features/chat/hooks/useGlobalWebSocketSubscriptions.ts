import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { queryKeys } from '@/config/queryKeys';
import type { AckEvent, ChatMessageEvent, ConversationUpgradedEvent } from '@/lib/websocket';
import { websocketService } from '@/lib/websocket';
import { useChatStore } from '../store';
import type { MessageResponse } from '@/shared/types/backend.types';
import type { Slice } from '@/shared/types/pagination.types';

interface InfiniteMessagesData {
    pages: Slice<MessageResponse>[];
    pageParams: number[];
}

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return ((...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    }) as T;
}

export function useGlobalWebSocketSubscriptions() {
    const queryClient = useQueryClient();
    const { handleAck, addMessageRequest, setParticipantStatus } = useChatStore();

    const debouncedInvalidateConversations = useRef(
        debounce(() => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });
        }, 1000)
    ).current;

    useEffect(() => {
        const syncInterval = setInterval(() => {
            if (websocketService.isConnected()) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.conversations.all,
                    refetchType: 'none',
                });
            }
        }, 30000);

        return () => clearInterval(syncInterval);
    }, [queryClient]);

    useEffect(() => {
        if (!websocketService.isConnected()) {
            return;
        }

        const handleIncomingMessage = (event: ChatMessageEvent) => {
            console.log('[Global WS] Incoming message:', event);

            const queryKey = queryKeys.messages.list(event.conversationId, {});
            queryClient.setQueryData<InfiniteMessagesData>(queryKey, (oldData) => {
                if (!oldData?.pages?.length) return oldData;

                const messageResponse: MessageResponse = {
                    id: event.id,
                    senderId: event.senderId,
                    senderName: event.senderName,
                    senderAvatarUrl: event.senderAvatarUrl,
                    content: event.content,
                    messageType: event.messageType,
                    conversationId: event.conversationId,
                    timestamp: event.timestamp,
                    isActive: true,
                    readBy: [],
                    replyToId: event.replyToId,
                };

                const exists = oldData.pages[0]?.content.some(msg => msg.id === event.id);
                if (exists) {
                    console.log('[Global WS] Duplicate message ignored:', event.id);
                    return oldData;
                }

                const newPages = [...oldData.pages];
                newPages[0] = {
                    ...newPages[0],
                    content: [messageResponse, ...newPages[0].content],
                    numberOfElements: newPages[0].numberOfElements + 1,
                };

                console.log('[Global WS] Message added to cache:', event.id);
                return { ...oldData, pages: newPages };
            });

            if (event.isRequest) {
                addMessageRequest(event);
                console.log('[Global WS] Added message request:', event.conversationId);
            }

            debouncedInvalidateConversations();
        };

        const handleAckEvent = (ack: AckEvent) => {
            console.log('[Global WS] ACK received:', ack);
            handleAck(ack);

            if (ack.conversationId && (ack.status === 'DELIVERED' || ack.status === 'DUPLICATE')) {
                debouncedInvalidateConversations();
            }
        };

        const handleConversationEvent = (event: ConversationUpgradedEvent) => {
            console.log('[Global WS] Conversation event:', event);
            
            if (event.conversationId) {
                setParticipantStatus(event.conversationId, event.newStatus);
                debouncedInvalidateConversations();
            }
        };

        websocketService.subscribeToAllUserQueues({
            onMessage: handleIncomingMessage,
            onAck: handleAckEvent,
            onConversationEvent: handleConversationEvent,
        });

        console.log('[Global WS] Global subscriptions initialized');

        return () => {
            websocketService.unsubscribeFromUserQueues();
            console.log('[Global WS] Global subscriptions cleaned up');
        };
    }, [queryClient, handleAck, addMessageRequest, setParticipantStatus, debouncedInvalidateConversations]);
}
