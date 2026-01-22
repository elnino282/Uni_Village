import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { generateMessageId, isVirtualThreadId } from '../services';
import {
    ensureDirectConversation,
    sendImageMessage as rtdbSendImageMessage,
    sendSharedCardMessage as rtdbSendSharedCardMessage,
    sendTextMessage as rtdbSendTextMessage,
    type ConversationParticipant,
} from '../services/firebaseRtdb.service';
import { uploadChatImage } from '../services/media.service';
import type { ChatMessageRecord, SharedCard } from '../types';
import { messageKeys } from './useMessages';

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
    status: 'sending' | 'sent',
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

function mapRtdbToChatRecord(message: {
    id: string;
    conversationId: string;
    legacySenderId?: number;
    senderName?: string;
    senderAvatarUrl?: string;
    type: 'text' | 'image' | 'sharedCard';
    text?: string;
    imageUrl?: string;
    card?: SharedCard;
    createdAt: number;
    isActive: boolean;
    clientMessageId?: string;
}): ChatMessageRecord {
    return {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.legacySenderId ?? 0,
        senderName: message.senderName,
        senderAvatarUrl: message.senderAvatarUrl,
        messageType: message.type,
        content: message.text,
        imageUrl: message.imageUrl,
        card: message.card,
        createdAt: new Date(message.createdAt).toISOString(),
        isActive: message.isActive,
        _clientMessageId: message.clientMessageId,
        _status: 'sent',
    };
}

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

            return ensureDirectConversation(sender, recipient);
        },
        []
    );

    const sendMessage = useCallback(
        async (input: SendMessageInput) => {
            const clientMessageId = generateMessageId();
            const createdAt = new Date().toISOString();
            const senderLegacyId = input.senderInfo.legacyUserId ?? 0;

            const optimisticMessage: ChatMessageRecord = {
                id: clientMessageId,
                conversationId: input.threadId,
                senderId: senderLegacyId,
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
                const realMessage = await rtdbSendTextMessage(
                    conversationId,
                    input.text,
                    {
                        displayName: input.senderInfo.displayName,
                        avatarUrl: input.senderInfo.avatarUrl,
                        legacyUserId: senderLegacyId,
                    },
                    clientMessageId
                );

                replaceOptimisticWithReal(
                    queryClient,
                    input.threadId,
                    clientMessageId,
                    mapRtdbToChatRecord(realMessage)
                );
                return { ...mapRtdbToChatRecord(realMessage), conversationId };
            } catch (error) {
                updateOptimisticStatus(queryClient, input.threadId, clientMessageId, 'sending', (error as Error)?.message ?? 'Failed');
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
            const senderLegacyId = senderInfo.legacyUserId ?? 0;

            const optimisticMessage: ChatMessageRecord = {
                id: clientMessageId,
                conversationId: threadId,
                senderId: senderLegacyId,
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
                const imageUrl = await uploadChatImage(conversationId, file);
                const realMessage = await rtdbSendImageMessage(
                    conversationId,
                    imageUrl,
                    caption,
                    {
                        displayName: senderInfo.displayName,
                        avatarUrl: senderInfo.avatarUrl,
                        legacyUserId: senderLegacyId,
                    }
                );
                replaceOptimisticWithReal(
                    queryClient,
                    threadId,
                    clientMessageId,
                    mapRtdbToChatRecord(realMessage)
                );
                return { ...mapRtdbToChatRecord(realMessage), conversationId };
            } catch (error) {
                updateOptimisticStatus(queryClient, threadId, clientMessageId, 'sending', (error as Error)?.message ?? 'Failed');
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
            return rtdbSendSharedCardMessage(conversationId, card, {
                displayName: senderInfo.displayName,
                avatarUrl: senderInfo.avatarUrl,
                legacyUserId: senderInfo.legacyUserId,
            });
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


