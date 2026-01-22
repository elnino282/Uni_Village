/**
 * Thread Service
 * Provides thread/conversation data using Firebase
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuthStore } from '@/features/auth/store/authStore';
import { profileApi } from '@/features/profile/api/profileApi';
import type { ChatThread, GroupThread, ThreadInfo, ThreadResponse } from '../types';
import { getConversation, getMediaMessages, type ConversationParticipant } from './firebaseChat.service';

/**
 * Check if a thread ID is a virtual thread (user-{userId})
 */
export function isVirtualThreadId(threadId: string): boolean {
    return threadId.startsWith('user-');
}

/**
 * Extract user ID from virtual thread ID
 */
export function extractUserIdFromVirtualThread(threadId: string): number | null {
    if (!isVirtualThreadId(threadId)) return null;
    const userId = threadId.replace('user-', '');
    return parseInt(userId, 10);
}

/**
 * Check if a thread ID belongs to a group/channel
 */
export function isGroupThreadId(threadId: string): boolean {
    return threadId.startsWith('group-') || threadId.startsWith('channel-');
}

function mapConversationToThread(
    conversation: FirebaseConversation,
    currentUserId?: number
): ChatThread {
    const fallbackPeer: ConversationParticipant = conversation.participants?.[0] ?? {
        id: 0,
        displayName: 'Người dùng',
    };

    const peer = conversation.participants?.find((p) => p.id !== currentUserId) ?? fallbackPeer;

    return {
        id: conversation.id,
        type: 'dm',
        peer: {
            id: peer.id,
            displayName: peer.displayName || 'Người dùng',
            avatarUrl: peer.avatarUrl,
        },
        onlineStatus: 'offline',
        onlineStatusText: 'Offline',
        relationshipStatus: 'NONE',
        participantStatus: 'INBOX',
    };
}

function mapGroupConversationToThread(conversation: FirebaseConversation): GroupThread {
    const memberCount = conversation.memberCount ?? conversation.participants?.length ?? 0;

    return {
        id: conversation.id,
        type: 'group',
        name: conversation.name || 'Kênh',
        avatarUrl: conversation.avatarUrl,
        memberCount,
        onlineCount: 0,
    };
}

/**
 * Fetch DM thread metadata from Firebase
 */
export async function fetchThread(conversationId: string): Promise<ThreadResponse> {
    try {
        const conversation = await getConversation(conversationId);
        const currentUserId = useAuthStore.getState().user?.id;

        if (conversation) {
            if (conversation.type === 'group') {
                return { thread: mapGroupConversationToThread(conversation) };
            }
            return { thread: mapConversationToThread(conversation, currentUserId) };
        }

        return {
            thread: {
                id: conversationId,
                type: 'dm',
                peer: {
                    id: 0,
                    displayName: 'Người dùng',
                    avatarUrl: undefined,
                },
                onlineStatus: 'offline',
                onlineStatusText: 'Offline',
                relationshipStatus: 'NONE',
                participantStatus: 'INBOX',
            },
        };
    } catch (error) {
        console.error('[Thread Service] Error fetching thread:', error);
        return {
            thread: {
                id: conversationId,
                type: 'dm',
                peer: {
                    id: 0,
                    displayName: 'Người dùng',
                    avatarUrl: undefined,
                },
                onlineStatus: 'offline',
                onlineStatusText: 'Offline',
                relationshipStatus: 'NONE',
                participantStatus: 'INBOX',
            },
        };
    }
}

/**
 * Fetch virtual thread metadata from user profile
 */
export async function fetchVirtualThread(userId: number): Promise<ThreadResponse> {
    try {
        const profile = await profileApi.getProfile(userId);

        return {
            thread: {
                id: `user-${userId}`,
                type: 'dm',
                peer: {
                    id: userId,
                    displayName: profile.displayName || profile.username || 'Người dùng',
                    avatarUrl: profile.avatarUrl,
                },
                onlineStatus: 'offline',
                onlineStatusText: 'Offline',
                relationshipStatus: 'NONE',
                participantStatus: 'INBOX',
            },
        };
    } catch (error) {
        console.error('[Thread Service] Error fetching virtual thread:', error);
        return {
            thread: {
                id: `user-${userId}`,
                type: 'dm',
                peer: {
                    id: userId,
                    displayName: 'Người dùng',
                    avatarUrl: undefined,
                },
                onlineStatus: 'offline',
                onlineStatusText: 'Offline',
                relationshipStatus: 'NONE',
                participantStatus: 'INBOX',
            },
        };
    }
}

/**
 * Fetch group/channel thread metadata from Firebase
 */
export async function fetchGroupThread(conversationId: string): Promise<ThreadResponse | null> {
    try {
        const conversation = await getConversation(conversationId);
        if (conversation && conversation.type === 'group') {
            return { thread: mapGroupConversationToThread(conversation) };
        }
        return null;
    } catch (error) {
        console.error('[Thread Service] Error fetching group thread:', error);
        return null;
    }
}

/**
 * Fetch thread info for info sidebar
 */
export async function fetchThreadInfo(threadId: string): Promise<ThreadInfo> {
    if (isVirtualThreadId(threadId)) {
        const userId = extractUserIdFromVirtualThread(threadId);
        if (!userId) {
            throw new Error('Invalid virtual thread ID');
        }

        const profile = await profileApi.getProfile(userId);
        const muteStatus = await getMuteStatus(threadId);

        return {
            threadId,
            peerId: String(userId),
            peerName: profile.displayName || profile.username || 'Người dùng',
            peerAvatarUrl: profile.avatarUrl,
            isMuted: muteStatus,
            isBlocked: false,
            sentMediaCount: 0,
        };
    }

    const conversation = await getConversation(threadId);
    if (!conversation) {
        throw new Error('Conversation not found');
    }

    const currentUserId = useAuthStore.getState().user?.id;
    const peer = conversation.participants.find((p) => p.id !== currentUserId) ?? conversation.participants[0];

    const mediaList = await getMediaMessages(threadId).catch(() => []);
    const muteStatus = await getMuteStatus(threadId);

    return {
        threadId,
        peerId: String(peer?.id ?? ''),
        peerName: peer?.displayName || 'Người dùng',
        peerAvatarUrl: peer?.avatarUrl,
        isMuted: muteStatus,
        isBlocked: false,
        sentMediaCount: mediaList.length,
    };
}

async function getMuteStatus(threadId: string): Promise<boolean> {
    try {
        const key = `mute_${threadId}`;
        const value = await AsyncStorage.getItem(key);
        return value === 'true';
    } catch (error) {
        console.error('[Thread Service] Error getting mute status:', error);
        return false;
    }
}

async function setMuteStatus(threadId: string, isMuted: boolean): Promise<void> {
    try {
        const key = `mute_${threadId}`;
        await AsyncStorage.setItem(key, String(isMuted));
    } catch (error) {
        console.error('[Thread Service] Error setting mute status:', error);
        throw error;
    }
}

export async function toggleThreadMute(threadId: string): Promise<boolean> {
    try {
        const currentStatus = await getMuteStatus(threadId);
        const newStatus = !currentStatus;
        await setMuteStatus(threadId, newStatus);
        return newStatus;
    } catch (error) {
        console.error('[Thread Service] Error toggling mute:', error);
        throw error;
    }
}
