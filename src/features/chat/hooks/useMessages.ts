import { useEffect, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/authStore';
import type { MessageRequest } from '@/shared/types/backend.types';
import { handleApiError } from '@/shared/utils';
import type { ChatMessageRecord } from '../types';
import {
    getAllMessages,
    sendImageMessage,
    sendTextMessage,
    subscribeToMessages,
    type ConversationParticipant,
} from '../services';
import { isVirtualThreadId } from '../services';

const STALE_TIME = 10 * 1000;

export const messageKeys = {
    all: ['messages'] as const,
    list: (threadId: string) => [...messageKeys.all, threadId] as const,
};

interface MessagesQueryResult {
    data: ChatMessageRecord[];
    isLoading: boolean;
    error?: Error;
}

export function useMessages(conversationId: string | undefined): MessagesQueryResult {
    const queryClient = useQueryClient();
    const [data, setData] = useState<ChatMessageRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        if (!conversationId || isVirtualThreadId(conversationId)) {
            setData([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsubscribe = subscribeToMessages(
            conversationId,
            (messages) => {
                setData(messages);
                setIsLoading(false);
                queryClient.setQueryData(messageKeys.list(conversationId), messages);
            },
            (err) => {
                setError(err);
                setIsLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [conversationId, queryClient]);

    return { data, isLoading, error };
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: MessageRequest) => {
            const user = useAuthStore.getState().user;
            if (!user || !user.id) {
                throw new Error('User not authenticated');
            }

            const sender: ConversationParticipant = {
                id: user.id,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            };

            return sendTextMessage(data.ConversationId, sender, data.content ?? '');
        },
        onSuccess: (_, variables) => {
            if (variables.ConversationId) {
                queryClient.invalidateQueries({ queryKey: messageKeys.list(variables.ConversationId) });
            }
        },
        onError: (error) => {
            handleApiError(error, 'Gửi tin nhắn');
        },
    });
}

export function useSendMessageWithFiles() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { conversationId: string; content?: string; files: any[] }) => {
            const user = useAuthStore.getState().user;
            if (!user || !user.id) {
                throw new Error('User not authenticated');
            }

            const sender: ConversationParticipant = {
                id: user.id,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            };

            const [file] = data.files;
            if (!file) {
                throw new Error('No file selected');
            }

            return sendImageMessage(
                data.conversationId,
                sender,
                {
                    uri: file.uri,
                    name: file.name ?? `image_${Date.now()}.jpg`,
                    type: file.type ?? 'image/jpeg',
                },
                data.content
            );
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: messageKeys.list(variables.conversationId) });
        },
        onError: (error) => {
            handleApiError(error, 'Gửi hình ảnh');
        },
    });
}

export function useUpdateMessage() {
    return useMutation({
        mutationFn: async () => {
            throw new Error('Update message is not supported with Firebase yet');
        },
    });
}

export function useDeleteMessage() {
    return useMutation({
        mutationFn: async () => {
            throw new Error('Delete message is handled via unsend in Firebase');
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

export function useSearchMessages(params: { conversationId: string; keyword: string } | undefined) {
    const keyword = params?.keyword?.trim().toLowerCase() ?? '';

    return useInfiniteQuery<SearchResultPage>({
        queryKey: ['messageSearch', params?.conversationId ?? '', keyword],
        queryFn: async () => {
            if (!params?.conversationId || !keyword) {
                return { content: [] };
            }

            const messages = await getAllMessages(params.conversationId).catch(() => []);
            const filtered = messages.filter(
                (msg) =>
                    msg.isActive !== false &&
                    (msg.content ?? '').toLowerCase().includes(keyword)
            );
            return { content: filtered };
        },
        initialPageParam: 0,
        getNextPageParam: () => undefined,
        enabled: !!params?.conversationId && keyword.length >= 2,
        staleTime: STALE_TIME,
    });
}
