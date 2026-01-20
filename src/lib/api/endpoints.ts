/**
 * API Endpoints Constants
 * Centralized API endpoint definitions for VNU Guide Backend
 */

export const API_ENDPOINTS = {
    // ============================================
    // Authentication
    // ============================================
    AUTH: {
        REGISTER: '/api/v1/auth/register',
        VERIFY_REGISTER_OTP: '/api/v1/auth/verify-otp-register',
        AUTHENTICATE: '/api/v1/auth/authenticate',
        FORGOT_PASSWORD: '/api/v1/auth/forget-password',
        VERIFY_FORGOT_PASSWORD_OTP: '/api/v1/auth/verify-otp-forget-password',
        REFRESH: '/api/v1/auth/refresh-token',
    },

    // ============================================
    // Users
    // ============================================
    USERS: {
        CHANGE_PASSWORD: '/api/v1/users/changepassword',
    },

    // ============================================
    // Areas
    // ============================================
    AREAS: {
        LIST: '/api/v1/areas',
        CREATE: '/api/v1/admin/areas',
        UPDATE: (id: number) => `/api/v1/admin/areas/${id}`,
    },

    // ============================================
    // Place Types
    // ============================================
    PLACE_TYPES: {
        LIST: '/api/v1/place-types',
        CREATE: '/api/v1/admin/place-types',
        UPDATE: (id: number) => `/api/v1/admin/place-types/${id}`,
    },

    // ============================================
    // Places
    // ============================================
    PLACES: {
        SEARCH: '/api/v1/places',
        NEARBY: '/api/v1/places/nearby',
        DETAIL: (id: number) => `/api/v1/places/${id}`,
    },

    // ============================================
    // Tours (Itineraries)
    // ============================================
    TOURS: {
        MY_TOURS: '/api/v1/me/tours',
        CURRENT_TOUR: '/api/v1/me/tours/current',
        CREATE: '/api/v1/me/tours',
        DETAIL: (id: number) => `/api/v1/tours/${id}`,
        UPDATE: (id: number) => `/api/v1/me/tours/${id}`,
        COMPLETE: (id: number) => `/api/v1/me/tours/${id}/complete`,
        CANCEL: (id: number) => `/api/v1/me/tours/${id}/cancel`,
        SHARE_AS_POST: (id: number) => `/api/v1/me/tours/${id}/share-as-post`,
        COPY: (id: number) => `/api/v1/tours/${id}/copy`,
    },

    // ============================================
    // Tour Stops
    // ============================================
    TOUR_STOPS: {
        LIST: (tourId: number) => `/api/v1/tours/${tourId}/stops`,
        ADD: (tourId: number) => `/api/v1/me/tours/${tourId}/stops`,
        REORDER: (tourId: number) => `/api/v1/me/tours/${tourId}/stops/reorder`,
        REMOVE: (tourId: number, stopId: number) => `/api/v1/me/tours/${tourId}/stops/${stopId}`,
    },

    // ============================================
    // Check-ins
    // ============================================
    CHECK_INS: {
        CREATE: '/api/v1/check-ins',
        MY_CHECK_INS: '/api/v1/me/check-ins',
    },

    // ============================================
    // AI Itinerary
    // ============================================
    AI: {
        SUGGEST_ITINERARY: '/ai/itineraries/suggest',
    },

    // ============================================
    // Locations
    // ============================================
    LOCATIONS: {
        PROVINCES: '/api/v1/locations/provinces',
        DISTRICTS: '/api/v1/locations/districts',
        WARDS: '/api/v1/locations/wards',
    },

    // ============================================
    // Places
    // ============================================
    PLACES: {
        SEARCH: '/api/v1/places',
        NEARBY: '/api/v1/places/nearby',
        BY_ID: (id: number) => `/api/v1/places/${id}`,
        CREATE: '/api/v1/admin/places',
        UPDATE: (id: number) => `/api/v1/admin/places/${id}`,
        UPDATE_STATUS: (id: number) => `/api/v1/admin/places/${id}/status`,
    },

    // ============================================
    // Place Suggestions
    // ============================================
    PLACE_SUGGESTIONS: {
        CREATE: '/api/v1/place-suggestions',
        MY_SUGGESTIONS: '/api/v1/me/place-suggestions',
        ADMIN_LIST: '/api/v1/admin/place-suggestions',
        REVIEW: (id: number) => `/api/v1/admin/place-suggestions/${id}/review`,
    },

    // ============================================
    // Personal Pins
    // ============================================
    PERSONAL_PINS: {
        LIST: '/api/v1/me/personal-pins',
        CREATE: '/api/v1/me/personal-pins',
        UPDATE: (id: number) => `/api/v1/me/personal-pins/${id}`,
        DELETE: (id: number) => `/api/v1/me/personal-pins/${id}`,
    },

    // ============================================
    // Tours
    // ============================================
    TOURS: {
        MY_TOURS: '/api/v1/me/tours',
        CURRENT: '/api/v1/me/tours/current',
        BY_ID: (id: number) => `/api/v1/tours/${id}`,
        UPDATE: (id: number) => `/api/v1/me/tours/${id}`,
        COMPLETE: (id: number) => `/api/v1/me/tours/${id}/complete`,
        CANCEL: (id: number) => `/api/v1/me/tours/${id}/cancel`,
        SHARE_AS_POST: (id: number) => `/api/v1/me/tours/${id}/share-as-post`,
        COPY: (id: number) => `/api/v1/tours/${id}/copy`,
    },

    // ============================================
    // Tour Stops
    // ============================================
    TOUR_STOPS: {
        LIST: (tourId: number) => `/api/v1/tours/${tourId}/stops`,
        CREATE: (tourId: number) => `/api/v1/me/tours/${tourId}/stops`,
        REORDER: (tourId: number) => `/api/v1/me/tours/${tourId}/stops/reorder`,
        DELETE: (tourId: number, stopId: number) => `/api/v1/me/tours/${tourId}/stops/${stopId}`,
    },

    // ============================================
    // Check-ins
    // ============================================
    CHECK_INS: {
        CREATE: '/api/v1/check-ins',
        MY_CHECK_INS: '/api/v1/me/check-ins',
    },

    // ============================================
    // AI Itinerary
    // ============================================
    AI: {
        SUGGEST_ITINERARY: '/ai/itineraries/suggest',
    },

    // ============================================
    // Posts
    // ============================================
    POSTS: {
        CREATE: '/api/v1/posts/create',
        LIST: '/api/v1/posts',
        MY_POSTS: '/api/v1/posts/me',
        SAVED_POSTS: '/api/v1/posts/me/saved-posts',
        BY_ID: (id: number) => `/api/v1/posts/${id}`,
        COMMENTS: (postId: number) => `/api/v1/posts/${postId}/comments`,
        SAVE: (postId: number) => `/api/v1/posts/${postId}/save`,
        SHARE: (postId: number) => `/api/v1/posts/${postId}/share`,
    },

    // ============================================
    // Comments
    // ============================================
    COMMENTS: {
        CREATE: '/api/v1/comments',
        UPDATE: (commentId: number) => `/api/v1/comments/${commentId}`,
        DELETE: (commentId: number) => `/api/v1/comments/${commentId}`,
        REPLIES: (commentId: number) => `/api/v1/comments/${commentId}/replies`,
    },

    // ============================================
    // Reactions (Likes)
    // ============================================
    REACTIONS: {
        LIKE_POST: (postId: number) => `/api/v1/likes/post/${postId}`,
        LIKE_COMMENT: (commentId: number) => `/api/v1/likes/comment/${commentId}`,
    },

    // ============================================
    // Conversations
    // ============================================
    CONVERSATIONS: {
        CREATE_PRIVATE: '/api/v1/conversations/create',
        PRIVATE_LIST: '/api/v1/conversations/private',
        CHANNELS_LIST: '/api/v1/conversations/channels',
        DELETE: (conversationId: string) => `/api/v1/conversations/delete-conversation/${conversationId}`,
        MEDIA: (conversationId: string) => `/api/v1/conversations/${conversationId}/media`,
        JOIN: (conversationId: string) => `/api/v1/conversations/join/${conversationId}`,
        ACCEPT_JOIN: (joinRequestId: number) => `/api/v1/conversations/join/accept/${joinRequestId}`,
        REJECT_JOIN: (joinRequestId: number) => `/api/v1/conversations/join/reject/${joinRequestId}`,
    },

    // ============================================
    // Channels
    // ============================================
    CHANNELS: {
        CREATE: '/api/v1/channels',
        BY_ID: (channelId: number) => `/api/v1/channels/${channelId}`,
        BY_CONVERSATION: (conversationId: string) => `/api/v1/channels/conversation/${conversationId}`,
        MEMBERS: (channelId: number) => `/api/v1/channels/${channelId}/members`,
        REMOVE_MEMBER: (channelId: number, memberId: number) => `/api/v1/channels/${channelId}/members/${memberId}`,
        JOIN_REQUESTS: (channelId: number) => `/api/v1/channels/${channelId}/join-requests`,
    },

    // ============================================
    // Messages
    // ============================================
    MESSAGES: {
        SEND: '/api/v1/messages/send',
        UPLOAD_FILE: '/api/v1/messages/upload-file',
        LIST: '/api/v1/messages',
        BY_ID: (messageId: number) => `/api/v1/messages/${messageId}`,
        MARK_READ: '/api/v1/messages/mark-read',
        SEARCH: '/api/v1/messages/search',
    },
} as const;

