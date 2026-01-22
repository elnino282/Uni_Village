/**
 * useMessageActions Hook
 * Provides message-level actions like unsend, copy, reply
 * Implements optimistic UI updates and error handling
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { ChatMessageRecord } from '../types';
import { handleApiError, showSuccessToast } from '@/shared/utils';
import { unsendMessage } from '../services';
import { messageKeys } from './useMessages';

interface UnsendMessageInput {
    messageId: string;
    conversationId: string;
}

export function useMessageActions() {
    const queryClient = useQueryClient();

    const unsendMessageMutation = useMutation({
        mutationFn: async ({ conversationId, messageId }: UnsendMessageInput) => {
            await unsendMessage(conversationId, messageId);
        },
        onMutate: async ({ messageId, conversationId }: UnsendMessageInput) => {
            const queryKey = messageKeys.list(conversationId);

            await queryClient.cancelQueries({ queryKey });

            const previousData = queryClient.getQueryData<ChatMessageRecord[]>(queryKey);

            queryClient.setQueryData<ChatMessageRecord[]>(queryKey, (oldData) => {
                if (!oldData?.length) return oldData;

                return oldData.map((msg) =>
                    msg.id === messageId
                        ? { ...msg, isActive: false, content: '', imageUrl: undefined, card: undefined }
                        : msg
                );
            });

            return { previousData, queryKey };
        },
        onError: (error, variables, context) => {
            console.error('[useMessageActions] Unsend failed:', error);

            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }

            handleApiError(error, 'Thu hồi tin nhắn');
        },
        onSuccess: () => {
            showSuccessToast('Đã thu hồi tin nhắn');
        },
    });

    const copyMessage = useCallback((text: string) => {
        console.log('[useMessageActions] Copy message:', text);
    }, []);

    return {
        unsendMessage: unsendMessageMutation,
        copyMessage,
        isUnsending: unsendMessageMutation.isPending,
    };
}
