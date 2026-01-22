import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { generateMessageId } from '../services';
import {
    ensureDirectConversation,
    sendImageMessage,
    sendSharedCardMessage,
    sendTextMessage,
    type ConversationParticipant,
} from '../services';
import type { ChatMessageRecord, SharedCard } from '../types';
import { messageKeys } from './useMessages';
import { isVirtualThreadId } from '../services';

interface SendMessageInput {
    threadId: string;
    text: string;
    replyToId?: string;
    recipient?: ConversationParticipant;
    senderInfo: ConversationParticipant;
}

const updateOptimisticStatus = (
    queryClient: ReturnType<typeof useQueryClient>,
    conversationId: string,
    clientMessageId: string,
    status: 'sending' | 'sent' | 'error',
    error?: string
) => {
    queryClient.setQueryData<ChatMessageRecord[]>(messageKeys.list(conversationId), (oldData) => {
        if (!oldData?.length) return oldData;
        return oldData.map((msg) =>
            msg._clientMessageId === clientMessageId
                ? { ...msg, _status: status, _error: error }
                : msg
        );
    });
};

const replaceOptimisticWithReal = (
    queryClient: ReturnType<typeof useQueryClient>,
    conversationId: string,
    clientMessageId: string,
    realMessage: ChatMessageRecord
) => {
    queryClient.setQueryData<ChatMessageRecord[]>(messageKeys.list(conversationId), (oldData) => {
        if (!oldData?.length) return [realMessage];
        return oldData.map((msg) =>
            msg._clientMessageId === clientMessageId ? realMessage : msg
        );
    });
};

export function useSendMessageHybrid() {
    const queryClient = useQueryClient();

    const resolveConversationId = useCallback(
        async (threadId: string, sender: ConversationParticipant, recipient?: ConversationParticipant) => {
            if (!isVirtualThreadId(threadId)) {
                return threadId;
            }

            if (!recipient) {
                throw new Error('Missing recipient info for virtual thread');
            }

            const currentUser = useAuthStore.getState().user;
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            return ensureDirectConversation(currentUser, recipient);
        },
        []
    );

    const sendMessage = useCallback(
        async (input: SendMessageInput) => {
            const clientMessageId = generateMessageId();
            const createdAt = new Date().toISOString();

            const optimisticMessage: ChatMessageRecord = {
                id: clientMessageId,
                conversationId: input.threadId,
                senderId: input.senderInfo.id,
                senderName: input.senderInfo.displayName,
                senderAvatarUrl: input.senderInfo.avatarUrl,
                messageType: 'text',
                content: input.text,
                createdAt,
                isActive: true,
                _clientMessageId: clientMessageId,
                _status: 'sending',
            };

            queryClient.setQueryData<ChatMessageRecord[]>(messageKeys.list(input.threadId), (oldData) => {
                return oldData ? [optimisticMessage, ...oldData] : [optimisticMessage];
            });

            try {
                const conversationId = await resolveConversationId(
                    input.threadId,
                    input.senderInfo,
                    input.recipient
                );
                const realMessage = await sendTextMessage(
                    conversationId,
                    input.senderInfo,
                    input.text
                );

                replaceOptimisticWithReal(queryClient, input.threadId, clientMessageId, realMessage);
                return { ...realMessage, conversationId };
            } catch (error) {
                updateOptimisticStatus(queryClient, input.threadId, clientMessageId, 'error', 'Failed');
                throw error;
            }
        },
        [queryClient, resolveConversationId]
    );

    const sendImage = useCallback(
        async (
            threadId: string,
            file: { uri: string; name: string; type: string },
            senderInfo: ConversationParticipant,
            caption?: string,
            recipient?: ConversationParticipant
        ) => {
            const clientMessageId = generateMessageId();
            const createdAt = new Date().toISOString();

            const optimisticMessage: ChatMessageRecord = {
                id: clientMessageId,
                conversationId: threadId,
                senderId: senderInfo.id,
                senderName: senderInfo.displayName,
                senderAvatarUrl: senderInfo.avatarUrl,
                messageType: 'image',
                content: caption ?? '',
                imageUrl: file.uri,
                createdAt,
                isActive: true,
                _clientMessageId: clientMessageId,
                _status: 'sending',
            };

            queryClient.setQueryData<ChatMessageRecord[]>(messageKeys.list(threadId), (oldData) => {
                return oldData ? [optimisticMessage, ...oldData] : [optimisticMessage];
            });

            try {
                const conversationId = await resolveConversationId(threadId, senderInfo, recipient);
                const realMessage = await sendImageMessage(conversationId, senderInfo, file, caption);
                replaceOptimisticWithReal(queryClient, threadId, clientMessageId, realMessage);
                return { ...realMessage, conversationId };
            } catch (error) {
                updateOptimisticStatus(queryClient, threadId, clientMessageId, 'error', 'Failed');
                throw error;
            }
        },
        [queryClient, resolveConversationId]
    );

    const sendSharedCard = useCallback(
        async (
            threadId: string,
            card: SharedCard,
            senderInfo: ConversationParticipant,
            recipient?: ConversationParticipant
        ) => {
            const conversationId = await resolveConversationId(threadId, senderInfo, recipient);
            return sendSharedCardMessage(conversationId, senderInfo, card);
        },
        [resolveConversationId]
    );

    return {
        sendMessage,
        sendImage,
        sendSharedCard,
        canSend: true,
    };
}
