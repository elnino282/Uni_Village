/**
 * API Endpoints Constants
 * Centralized API endpoint definitions
 */

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        REGISTER: '/api/v1/auth/register',
        VERIFY_REGISTER_OTP: '/api/v1/auth/verify-otp-register',
        AUTHENTICATE: '/api/v1/auth/authenticate',
        FORGOT_PASSWORD: '/api/v1/auth/forget-password',
        VERIFY_FORGOT_PASSWORD_OTP: '/api/v1/auth/verify-otp-forget-password',
        REFRESH: '/api/v1/auth/refresh-token',
        LOGOUT: '/api/v1/auth/logout',
    },

    // Users
    USERS: {
        BASE: '/users',
        BY_ID: (id: string) => `/users/${id}`,
        PROFILE: (id: string) => `/users/${id}/profile`,
    },

    // Posts
    POSTS: {
        BASE: '/posts',
        BY_ID: (id: string) => `/posts/${id}`,
        FEED: '/posts/feed',
        BY_USER: (userId: string) => `/users/${userId}/posts`,
    },

    // Comments
    COMMENTS: {
        BY_POST: (postId: string) => `/posts/${postId}/comments`,
        BY_ID: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}`,
    },

    // Reactions
    REACTIONS: {
        BY_POST: (postId: string) => `/posts/${postId}/reactions`,
        TOGGLE: (postId: string) => `/posts/${postId}/reactions/toggle`,
    },

    // Chat
    CHAT: {
        CONVERSATIONS: '/chat/conversations',
        BY_ID: (id: string) => `/chat/conversations/${id}`,
        MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    },

    // Locations
    LOCATIONS: {
        BASE: '/locations',
        NEARBY: '/locations/nearby',
        BY_ID: (id: string) => `/locations/${id}`,
    },
} as const;
