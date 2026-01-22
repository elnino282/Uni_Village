/**
 * Thread Service
 * Provides thread/conversation data using Firebase RTDB
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuthStore } from '@/features/auth/store/authStore';
import { profileApi } from '@/features/profile/api/profileApi';
import type { ChannelResponse, ConversationResponse } from '@/shared/types/backend.types';
import { channelsApi, conversationsApi } from '../api';
import { auth } from '@/lib/firebase';
import type { ChatThread, GroupThread, ThreadInfo, ThreadResponse } from '../types';
import {
    getConversation,
    type RtdbConversation,
    type RtdbConversationMember,
} from './firebaseRtdb.service';
import { getMediaMessages } from './media.service';

/**
 * Check if a thread ID is a virtual thread (user-{userId})
 */
function isVirtualThreadId(threadId: string): boolean {
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

function resolvePeer(conversation: RtdbConversation): {
    peerUid?: string;
    peerDetails?: RtdbConversationMember;
    peerLegacyId?: number;
} {
    const currentUid = auth.currentUser?.uid;
    const currentLegacyId = useAuthStore.getState().user?.id;
    const memberDetails = conversation.memberDetails ?? {};
    const memberEntries = Object.entries(memberDetails);

    let peerUid: string | undefined;
    let peerDetails: RtdbConversationMember | undefined;

    if (memberEntries.length > 0) {
        const match =
            memberEntries.find(
                ([uid, member]) =>
                    uid !== currentUid && member?.legacyUserId !== currentLegacyId
            ) ?? memberEntries[0];

        peerUid = match?.[0];
        peerDetails = match?.[1];
    } else {
        const memberUids = Object.keys(conversation.members ?? {});
        peerUid = memberUids.find((uid) => uid !== currentUid) ?? memberUids[0];
    }

    const peerLegacyId =
        peerDetails?.legacyUserId ??
        (peerUid && !Number.isNaN(Number(peerUid)) ? Number(peerUid) : 0);

    return { peerUid, peerDetails, peerLegacyId };
}

function mapConversationToThread(conversation: RtdbConversation): ChatThread {
    const { peerUid, peerDetails, peerLegacyId } = resolvePeer(conversation);

    return {
        id: conversation.id,
        type: 'dm',
        peer: {
            id: peerLegacyId ?? 0,
            uid: peerUid,
            displayName: peerDetails?.displayName || 'Ngu?i d?ng',
            avatarUrl: peerDetails?.avatarUrl,
        },
        onlineStatus: 'offline',
        onlineStatusText: 'Offline',
        relationshipStatus: 'NONE',
        participantStatus: 'INBOX',
    };
}

function mapGroupConversationToThread(conversation: RtdbConversation): GroupThread {
    const memberCount = Object.keys(conversation.members ?? {}).length;

    return {
        id: conversation.id,
        type: 'group',
        name: conversation.name || 'K?nh',
        avatarUrl: conversation.avatarUrl,
        memberCount,
        onlineCount: 0,
    };
}

function mapBackendConversationToThread(conversation: ConversationResponse): ChatThread {
    return {
        id: conversation.id || '',
        type: 'dm',
        peer: {
            id: conversation.otherUserId ?? 0,
            uid: conversation.otherUserId ? conversation.otherUserId.toString() : undefined,
            displayName: conversation.name || 'Ngu?i d?ng',
            avatarUrl: conversation.avatarUrl,
        },
        onlineStatus: 'offline',
        onlineStatusText: 'Offline',
        relationshipStatus: conversation.relationshipStatus ?? 'NONE',
        participantStatus: conversation.participantStatus ?? 'INBOX',
    };
}

function mapBackendChannelToThread(channel: ChannelResponse): GroupThread {
    return {
        id: channel.conversationId || '',
        type: 'group',
        name: channel.name || 'K?nh',
        avatarUrl: channel.avatarUrl,
        memberCount: channel.memberCount || 0,
        onlineCount: 0,
    };
}

/**
 * Fetch DM thread metadata from Firebase RTDB
 */
export async function fetchThread(conversationId: string): Promise<ThreadResponse> {
    try {
        const conversation = await getConversation(conversationId);

        if (conversation) {
            if (conversation.type === 'group') {
                return { thread: mapGroupConversationToThread(conversation) };
            }
            return { thread: mapConversationToThread(conversation) };
        }

        try {
            const channelResponse = await channelsApi.getChannelByConversation(conversationId);
            if (channelResponse.result) {
                return { thread: mapBackendChannelToThread(channelResponse.result) };
            }
        } catch (error) {
            console.error('[Thread Service] Error fetching channel thread:', error);
        }

        try {
            const response = await conversationsApi.getPrivateConversations({ page: 0, size: 100 });
            const conversations = response.result?.content || [];
            const backendConversation = conversations.find((c) => c.id === conversationId);
            if (backendConversation) {
                return { thread: mapBackendConversationToThread(backendConversation) };
            }
        } catch (error) {
            console.error('[Thread Service] Error fetching backend conversation:', error);
        }

        return {
            thread: {
                id: conversationId,
                type: 'dm',
                peer: {
                    id: 0,
                    displayName: 'Ngu?i d?ng',
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
                    displayName: 'Ngu?i d?ng',
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

export async function fetchVirtualThread(userId: number): Promise<ThreadResponse> {
    try {
        const profile = await profileApi.getProfile(userId);

        return {
            thread: {
                id: `user-${userId}`,
                type: 'dm',
                peer: {
                    id: userId,
                    displayName: profile.displayName || profile.username || 'Ngu?i dùng',
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
                    displayName: 'Ngu?i dùng',
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
 * Fetch group/channel thread metadata from Firebase RTDB
 */
export async function fetchGroupThread(conversationId: string): Promise<ThreadResponse | null> {
    try {
        const conversation = await getConversation(conversationId);
        if (conversation && conversation.type === 'group') {
            return { thread: mapGroupConversationToThread(conversation) };
        }

        const response = await channelsApi.getChannelByConversation(conversationId);
        if (response.result) {
            return { thread: mapBackendChannelToThread(response.result) };
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
            peerName: profile.displayName || profile.username || 'Ngu?i dùng',
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

    const { peerUid, peerDetails, peerLegacyId } = resolvePeer(conversation);
    const mediaList = await getMediaMessages(threadId).catch(() => []);
    const muteStatus = await getMuteStatus(threadId);

    return {
        threadId,
        peerId: peerLegacyId ? String(peerLegacyId) : peerUid ?? '',
        peerName: peerDetails?.displayName || 'Ngu?i dùng',
        peerAvatarUrl: peerDetails?.avatarUrl,
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

