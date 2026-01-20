/**
 * Friend API Service
 * REST API calls for friend request and relationship management
 */
import { env } from '@/config/env';
import { apiClient } from '@/lib/api/client';

const BASE_URL = `${env.API_URL}/friends`;

/**
 * Relationship status between users
 */
export type RelationshipStatus =
    | 'NONE'
    | 'PENDING_OUTGOING'
    | 'PENDING_INCOMING'
    | 'FRIEND'
    | 'BLOCKED'
    | 'BLOCKED_BY';

/**
 * User summary for friend-related responses
 */
export interface UserSummary {
    id: number;
    displayName: string;
    username?: string;
    avatarUrl?: string;
}

/**
 * Relationship status response
 */
export interface RelationshipStatusResponse {
    status: RelationshipStatus;
    createdAt?: string;
    mutualFriendsCount?: number;
}

/**
 * Friend request item for lists
 */
export interface FriendRequestItem {
    user: UserSummary;
    status: RelationshipStatus;
    createdAt: string;
}

/**
 * Paginated list of friend requests
 */
export interface FriendRequestsPage {
    content: FriendRequestItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}

/**
 * Friend API methods
 */
export const friendsApi = {
    /**
     * Get relationship status with another user
     */
    getRelationshipStatus: async (targetUserId: number): Promise<RelationshipStatusResponse> => {
        const response = await apiClient.get<{ result: RelationshipStatusResponse }>(
            `${BASE_URL}/status/${targetUserId}`
        );
        return response.result;
    },

    /**
     * Send a friend request to a user
     */
    sendFriendRequest: async (targetUserId: number): Promise<void> => {
        await apiClient.post(`${BASE_URL}/request/${targetUserId}`);
    },

    /**
     * Accept an incoming friend request
     */
    acceptFriendRequest: async (requesterId: number): Promise<void> => {
        await apiClient.post(`${BASE_URL}/accept/${requesterId}`);
    },

    /**
     * Decline an incoming friend request
     */
    declineFriendRequest: async (requesterId: number): Promise<void> => {
        await apiClient.post(`${BASE_URL}/decline/${requesterId}`);
    },

    /**
     * Cancel an outgoing friend request
     */
    cancelFriendRequest: async (targetUserId: number): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/cancel/${targetUserId}`);
    },

    /**
     * Remove a friend
     */
    removeFriend: async (friendId: number): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${friendId}`);
    },

    /**
     * Block a user
     */
    blockUser: async (userId: number): Promise<void> => {
        await apiClient.post(`${BASE_URL}/block/${userId}`);
    },

    /**
     * Unblock a user
     */
    unblockUser: async (userId: number): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/block/${userId}`);
    },

    /**
     * Get incoming friend requests (pending)
     */
    getIncomingRequests: async (page = 0, size = 20): Promise<FriendRequestsPage> => {
        const response = await apiClient.get<{ result: FriendRequestsPage }>(
            `${BASE_URL}/requests/incoming?page=${page}&size=${size}`
        );
        return response.result;
    },

    /**
     * Get outgoing friend requests (sent by me)
     */
    getOutgoingRequests: async (page = 0, size = 20): Promise<FriendRequestsPage> => {
        const response = await apiClient.get<{ result: FriendRequestsPage }>(
            `${BASE_URL}/requests/outgoing?page=${page}&size=${size}`
        );
        return response.result;
    },

    /**
     * Get friends list
     */
    getFriends: async (page = 0, size = 20, search?: string): Promise<FriendRequestsPage> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await apiClient.get<{ result: FriendRequestsPage }>(
            `${BASE_URL}?${params}`
        );
        return response.result;
    },

    /**
     * Get mutual friends with a user
     */
    getMutualFriends: async (userId: number, page = 0, size = 20): Promise<FriendRequestsPage> => {
        const response = await apiClient.get<{ result: FriendRequestsPage }>(
            `${BASE_URL}/mutual/${userId}?page=${page}&size=${size}`
        );
        return response.result;
    },

    /**
     * Check if two users are friends
     */
    areFriends: async (userId: number): Promise<boolean> => {
        const status = await friendsApi.getRelationshipStatus(userId);
        return status.status === 'FRIEND';
    },
};
