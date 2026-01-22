/**
 * useChatSubscription hook
 * Subscribe to real-time message events via Firebase RTDB
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import { useFirebaseChat } from '@/providers/FirebaseChatProvider';
import { subscribeToMessagesSnapshot, type RtdbMessage } from '../services/firebaseRtdb.service';
import type { ChatMessageRecord, MessageType } from '../types';

/**
 * Query keys for messages - matches useMessages.ts
 */
export const messageKeys = {
    all: ['messages'] as const,
    list: (conversationId: string) => [...messageKeys.all, 'list', conversationId] as const,
};

/**
 * Convert RTDB message to ChatMessageRecord format
 */
function rtdbToChatRecord(msg: RtdbMessage): ChatMessageRecord {
    return {
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.legacySenderId ?? 0,
        senderName: msg.senderName,
        senderAvatarUrl: msg.senderAvatarUrl,
        messageType: msg.type as MessageType,
        content: msg.text,
        imageUrl: msg.imageUrl,
        card: msg.card,
        createdAt: new Date(msg.createdAt).toISOString(),
        isActive: msg.isActive,
        _clientMessageId: msg.clientMessageId,
        _status: 'sent',
    };
}

/**
 * Subscribe to real-time chat messages for a conversation via Firebase RTDB
 * Automatically updates React Query cache when messages change
 */
export function useChatSubscription(conversationId: string | undefined) {
    const queryClient = useQueryClient();
    const { isConnected } = useFirebaseChat();
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleMessagesUpdate = useCallback(
        (rtdbMessages: RtdbMessage[]) => {
            if (!conversationId || !isMountedRef.current) return;

            const messages = rtdbMessages
                .map(rtdbToChatRecord)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            if (isMountedRef.current) {
                queryClient.setQueryData<ChatMessageRecord[]>(
                    messageKeys.list(conversationId),
                    messages
                );
            }
        },
        [conversationId, queryClient]
    );

    useEffect(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }

        if (!conversationId || !isConnected) {
            return;
        }

        let isActive = true;

        const unsubscribe = subscribeToMessagesSnapshot(
            conversationId,
            (rtdbMessages) => {
                if (isActive && isMountedRef.current) {
                    handleMessagesUpdate(rtdbMessages);
                }
            },
            (error) => {
                if (isActive && isMountedRef.current) {
                    console.error('[useChatSubscription] Error:', error);
                }
            },
            100
        );

        unsubscribeRef.current = unsubscribe;

        return () => {
            isActive = false;
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [conversationId, isConnected, handleMessagesUpdate]);

    return {
        isSubscribed: !!unsubscribeRef.current && isConnected,
    };
}

/**
 * Hook to manage real-time connection and subscriptions for a conversation
 * Uses Firebase RTDB instead of WebSocket
 */
export function useChatRealtime(conversationId: string | undefined) {
    const { isConnected, isConnecting, reconnect } = useFirebaseChat();
    const { isSubscribed } = useChatSubscription(conversationId);

    return {
        socketStatus: isConnected ? 'connected' : isConnecting ? 'connecting' : 'disconnected',
        isSubscribed,
        isConnected,
        isConnecting,
        reconnect,
    };
}
