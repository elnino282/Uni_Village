import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import { getNextPageParam } from '@/shared/types/pagination.types';
import {
    messagesApi,
    type SendMessageFormData,
    type MessageSearchParams,
    type GetMessagesParams,
} from '../api';
import type { MessageRequest, MarkReadRequest } from '@/shared/types/backend.types';

const STALE_TIME = 10 * 1000;

export function useMessages(conversationId: string | undefined, params: Omit<GetMessagesParams, 'conversationId'> = {}) {
    return useInfiniteQuery({
        queryKey: queryKeys.messages.list(conversationId!, params),
        queryFn: async ({ pageParam = 0 }) => {
            const response = await messagesApi.getMessages({
                conversationId: conversationId!,
                ...params,
                page: pageParam,
            });
            return response.result;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => getNextPageParam(lastPage),
        enabled: !!conversationId,
        staleTime: STALE_TIME,
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MessageRequest) => messagesApi.sendMessage(data),
        onSuccess: (_, variables) => {
            if (variables.ConversationId) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.messages.list(variables.ConversationId, {}),
                });
                queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
            }
        },
    });
}

export function useSendMessageWithFiles() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SendMessageFormData) => messagesApi.sendMessageWithFiles(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.messages.list(variables.conversationId, {}),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
        },
    });
}

export function useUpdateMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, content, conversationId }: { messageId: number; content: string; conversationId: string }) =>
            messagesApi.updateMessage(messageId, content),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.messages.list(variables.conversationId, {}),
            });
        },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, conversationId }: { messageId: number; conversationId: string }) =>
            messagesApi.deleteMessage(messageId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.messages.list(variables.conversationId, {}),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
        },
    });
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MarkReadRequest) => messagesApi.markAsRead(data),
        onSuccess: (_, variables) => {
            if (variables.conversationId) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.messages.list(variables.conversationId, {}),
                });
                queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
            }
        },
    });
}

export function useSearchMessages(params: MessageSearchParams | undefined) {
    return useInfiniteQuery({
        queryKey: queryKeys.messages.search(params?.conversationId || '', params?.keyword || ''),
        queryFn: async ({ pageParam = 0 }) => {
            const response = await messagesApi.searchMessages({
                ...params!,
                page: pageParam,
            });
            return response.result;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => getNextPageParam(lastPage),
        enabled: !!params?.conversationId && !!params?.keyword,
        staleTime: STALE_TIME,
    });
}
