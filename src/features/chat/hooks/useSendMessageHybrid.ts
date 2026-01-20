import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import { queryKeys } from '@/config/queryKeys';
import { MessageType } from '@/lib/api/generated';
import { websocketService, WebSocketService } from '@/lib/websocket';
import type { MessageResponse } from '@/shared/types/backend.types';
import type { Slice } from '@/shared/types/pagination.types';
import { messagesApi } from '../api';
import { useChatStore } from '../store';

interface InfiniteMessagesData {
    pages: Slice<MessageResponse>[];
    pageParams: number[];
}

interface SendMessageInput {
    threadId: string;
    text: string;
    replyToId?: number;
    senderInfo: {
        id: number;
        displayName: string;
        avatarUrl?: string;
    };
}

interface OptimisticMessage extends MessageResponse {
    _clientMessageId: string;
    _isOptimistic: boolean;
    _status: 'sending' | 'sent' | 'error';
    _error?: string;
}

const ACK_TIMEOUT = 5000;

export function useSendMessageHybrid() {
    const queryClient = useQueryClient();
    const { handleAck } = useChatStore();
    const pendingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        return () => {
            pendingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
            pendingTimeoutsRef.current.clear();
        };
    }, []);

    const createOptimisticMessage = useCallback(
        (input: SendMessageInput, clientMessageId: string): OptimisticMessage => {
            return {
                id: -Date.now(),
                _clientMessageId: clientMessageId,
                _isOptimistic: true,
                _status: 'sending',
                senderId: input.senderInfo.id,
                senderName: input.senderInfo.displayName,
                senderAvatarUrl: input.senderInfo.avatarUrl,
                content: input.text,
                messageType: MessageType.TEXT,
                conversationId: input.threadId,
                timestamp: new Date().toISOString(),
                isActive: true,
                readBy: [],
                replyToId: input.replyToId,
            } as OptimisticMessage;
        },
        []
    );

    const updateOptimisticStatus = useCallback(
        (
            conversationId: string,
            clientMessageId: string,
            status: 'sending' | 'sent' | 'error',
            error?: string
        ) => {
            const queryKey = queryKeys.messages.list(conversationId, {});
            queryClient.setQueryData<InfiniteMessagesData>(queryKey, (oldData) => {
                if (!oldData?.pages?.length) return oldData;

                const newPages = oldData.pages.map((page) => ({
                    ...page,
                    content: page.content.map((msg) => {
                        const optimistic = msg as unknown as OptimisticMessage;
                        if (optimistic._clientMessageId === clientMessageId) {
                            return {
                                ...msg,
                                _status: status,
                                _error: error,
                            };
                        }
                        return msg;
                    }),
                }));

                return { ...oldData, pages: newPages };
            });
        },
        [queryClient]
    );

    const replaceOptimisticWithReal = useCallback(
        (conversationId: string, clientMessageId: string, realMessage: MessageResponse) => {
            const queryKey = queryKeys.messages.list(conversationId, {});
            queryClient.setQueryData<InfiniteMessagesData>(queryKey, (oldData) => {
                if (!oldData?.pages?.length) return oldData;

                const newPages = oldData.pages.map((page) => ({
                    ...page,
                    content: page.content.map((msg) => {
                        const optimistic = msg as unknown as OptimisticMessage;
                        if (optimistic._clientMessageId === clientMessageId) {
                            return realMessage;
                        }
                        return msg;
                    }),
                }));

                return { ...oldData, pages: newPages };
            });
        },
        [queryClient]
    );

    const removeOptimisticMessage = useCallback(
        (conversationId: string, clientMessageId: string) => {
            const queryKey = queryKeys.messages.list(conversationId, {});
            queryClient.setQueryData<InfiniteMessagesData>(queryKey, (oldData) => {
                if (!oldData?.pages?.length) return oldData;

                const newPages = oldData.pages.map((page) => ({
                    ...page,
                    content: page.content.filter((msg) => {
                        const optimistic = msg as unknown as OptimisticMessage;
                        return optimistic._clientMessageId !== clientMessageId;
                    }),
                }));

                return { ...oldData, pages: newPages };
            });
        },
        [queryClient]
    );

    const sendViaHTTP = useCallback(
        async (input: SendMessageInput, clientMessageId: string) => {
            console.log('[Hybrid Send] Falling back to HTTP:', clientMessageId);

            try {
                const response = await messagesApi.sendMessage({
                    content: input.text,
                    ConversationId: input.threadId,
                    replyToId: input.replyToId,
                });

                const realMessage = response.result;
                replaceOptimisticWithReal(input.threadId, clientMessageId, realMessage);

                queryClient.invalidateQueries({
                    queryKey: queryKeys.conversations.all,
                });

                console.log('[Hybrid Send] HTTP success:', realMessage.id);
                return realMessage;
            } catch (error) {
                console.error('[Hybrid Send] HTTP failed:', error);
                updateOptimisticStatus(
                    input.threadId,
                    clientMessageId,
                    'error',
                    'Failed to send message'
                );
                throw error;
            }
        },
        [queryClient, replaceOptimisticWithReal, updateOptimisticStatus]
    );

    const sendMessage = useCallback(
        async (input: SendMessageInput) => {
            const clientMessageId = WebSocketService.generateClientMessageId();
            const optimisticMessage = createOptimisticMessage(input, clientMessageId);

            const queryKey = queryKeys.messages.list(input.threadId, {});
            queryClient.setQueryData<InfiniteMessagesData>(queryKey, (oldData) => {
                if (!oldData?.pages?.length) {
                    return oldData;
                }

                const newPages = [...oldData.pages];
                newPages[0] = {
                    ...newPages[0],
                    content: [optimisticMessage as unknown as MessageResponse, ...newPages[0].content],
                    numberOfElements: newPages[0].numberOfElements + 1,
                };

                return { ...oldData, pages: newPages };
            });

            const isWSConnected = websocketService.isConnected();

            if (!isWSConnected) {
                console.log('[Hybrid Send] WebSocket not connected, using HTTP directly');
                return sendViaHTTP(input, clientMessageId);
            }

            console.log('[Hybrid Send] Attempting WebSocket send:', clientMessageId);

            websocketService.sendChatMessage({
                recipientId: Number(input.threadId.split('-')[1] || '0'),
                content: input.text,
                clientMessageId,
                replyToId: input.replyToId,
            });

            return new Promise<MessageResponse>((resolve, reject) => {
                let resolved = false;
                
                const timeout = setTimeout(async () => {
                    if (resolved) return;
                    console.log('[Hybrid Send] ACK timeout, falling back to HTTP:', clientMessageId);
                    pendingTimeoutsRef.current.delete(clientMessageId);
                    resolved = true;

                    try {
                        const realMessage = await sendViaHTTP(input, clientMessageId);
                        resolve(realMessage);
                    } catch (error) {
                        reject(error);
                    }
                }, ACK_TIMEOUT);

                pendingTimeoutsRef.current.set(clientMessageId, timeout);

                const checkInterval = setInterval(() => {
                    if (resolved) {
                        clearInterval(checkInterval);
                        return;
                    }

                    const pending = useChatStore.getState().pendingMessages.get(clientMessageId);
                    
                    if (!pending) {
                        const timeout = pendingTimeoutsRef.current.get(clientMessageId);
                        if (timeout) {
                            clearTimeout(timeout);
                            pendingTimeoutsRef.current.delete(clientMessageId);
                        }
                        clearInterval(checkInterval);
                        resolved = true;

                        updateOptimisticStatus(input.threadId, clientMessageId, 'sent');
                        
                        resolve(optimisticMessage as unknown as MessageResponse);
                    } else if (pending.status === 'error') {
                        const timeout = pendingTimeoutsRef.current.get(clientMessageId);
                        if (timeout) {
                            clearTimeout(timeout);
                            pendingTimeoutsRef.current.delete(clientMessageId);
                        }
                        clearInterval(checkInterval);
                        resolved = true;

                        updateOptimisticStatus(
                            input.threadId,
                            clientMessageId,
                            'error',
                            pending.errorMessage || 'Failed to send'
                        );

                        sendViaHTTP(input, clientMessageId)
                            .then(resolve)
                            .catch(reject);
                    }
                }, 100);
            });
        },
        [
            createOptimisticMessage,
            queryClient,
            sendViaHTTP,
            updateOptimisticStatus,
            replaceOptimisticWithReal,
            handleAck,
        ]
    );

    const retry = useCallback(
        async (conversationId: string, clientMessageId: string, input: SendMessageInput) => {
            console.log('[Hybrid Send] Retrying message:', clientMessageId);
            updateOptimisticStatus(conversationId, clientMessageId, 'sending');

            try {
                const realMessage = await sendViaHTTP(input, clientMessageId);
                return realMessage;
            } catch (error) {
                updateOptimisticStatus(
                    conversationId,
                    clientMessageId,
                    'error',
                    'Retry failed'
                );
                throw error;
            }
        },
        [sendViaHTTP, updateOptimisticStatus]
    );

    return {
        sendMessage,
        retry,
        canSend: websocketService.isConnected(),
    };
}
