import { queryKeys } from '@/config/queryKeys';
import type { MessageEvent, TypingEvent, WebSocketMessage } from '@/lib/websocket';
import { websocketService } from '@/lib/websocket';
import type { MessageResponse } from '@/shared/types/backend.types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useWebSocketConnection() {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const connect = useCallback(async () => {
        if (isConnected || isConnecting) return;

        try {
            setIsConnecting(true);
            setError(null);
            await websocketService.connect();
            setIsConnected(true);
        } catch (err) {
            setError(err as Error);
            setIsConnected(false);
        } finally {
            setIsConnecting(false);
        }
    }, [isConnected, isConnecting]);

    const disconnect = useCallback(() => {
        websocketService.disconnect();
        setIsConnected(false);
    }, []);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
    };
}

export function useConversationMessages(conversationId: string | undefined) {
    const queryClient = useQueryClient();
    const [realtimeMessages, setRealtimeMessages] = useState<MessageResponse[]>([]);

    useEffect(() => {
        if (!conversationId || !websocketService.isConnected()) {
            return;
        }

        const subscription = websocketService.subscribeToConversation(
            conversationId,
            (message: WebSocketMessage<MessageEvent>) => {
                if (message.eventType === 'SEND' && message.data.message) {
                    setRealtimeMessages((prev) => [...prev, message.data.message]);
                    
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.messages.list(conversationId, {}),
                    });
                } else if (message.eventType === 'EDIT' || message.eventType === 'UNSEND') {
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.messages.list(conversationId, {}),
                    });
                }
            }
        );

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [conversationId, queryClient]);

    return { realtimeMessages };
}

export function useTypingIndicator(conversationId: string | undefined) {
    const [typingUsers, setTypingUsers] = useState<Map<number, TypingEvent>>(new Map());
    const typingTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        if (!conversationId || !websocketService.isConnected()) {
            return;
        }

        const subscription = websocketService.subscribeToTyping(
            conversationId,
            (event: TypingEvent) => {
                const timeoutMap = typingTimeouts.current;
                const existingTimeout = timeoutMap.get(event.userId);
                
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }

                if (event.isTyping) {
                    setTypingUsers((prev) => {
                        const next = new Map(prev);
                        next.set(event.userId, event);
                        return next;
                    });

                    const timeout = setTimeout(() => {
                        setTypingUsers((prev) => {
                            const next = new Map(prev);
                            next.delete(event.userId);
                            return next;
                        });
                        timeoutMap.delete(event.userId);
                    }, 3000);

                    timeoutMap.set(event.userId, timeout);
                } else {
                    setTypingUsers((prev) => {
                        const next = new Map(prev);
                        next.delete(event.userId);
                        return next;
                    });
                    timeoutMap.delete(event.userId);
                }
            }
        );

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
            typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
            typingTimeouts.current.clear();
        };
    }, [conversationId]);

    const sendTypingEvent = useCallback(
        (isTyping: boolean) => {
            if (conversationId) {
                websocketService.sendTypingEvent(conversationId, isTyping);
            }
        },
        [conversationId]
    );

    const typingUsersList = Array.from(typingUsers.values());

    return {
        typingUsers: typingUsersList,
        isAnyoneTyping: typingUsersList.length > 0,
        sendTypingEvent,
    };
}

export function useRealtimeUpdates(conversationId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!conversationId || !websocketService.isConnected()) {
            return;
        }

        const subscription = websocketService.subscribeToUserQueue((message) => {
            if (message.eventType === 'SEEN' || message.eventType === 'DELIVERED') {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.messages.list(conversationId, {}),
                });
            }
        });

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [conversationId, queryClient]);
}
