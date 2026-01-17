/**
 * Post Types
 * TypeScript types for Posts feature - aligned with VNU Guide Backend
 */

import type { MessageType, PostType, Visibility } from '@/shared/types/enums.types';

// ============================================
// Post Types
// ============================================

export interface CreatePostRequest {
    content?: string;
    postType: PostType;
    visibility: Visibility;
    tourId?: string;
}

export interface UpdatePostRequest {
    content?: string;
    postType?: PostType;
    visibility?: Visibility;
}

export interface Post {
    id: number;
    content: string | null;
    postType: PostType;
    visibility: Visibility;
    authorId: number;
    authorName: string;
    authorAvatarUrl: string | null;
    mediaUrls: string[];
    createdAt: string;
    updatedAt: string;
    // Extended fields (may be populated by app)
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
    isLiked?: boolean;
    isSaved?: boolean;
}

// ============================================
// Comment Types
// ============================================

export interface CommentRequest {
    content: string;
    postId: number;
    parentCommentId?: number;
}

export interface CommentResponse {
    id: number;
    content: string;
    authorId: number;
    authorName: string;
    authorAvatarUrl: string | null;
    postId: number;
    parentCommentId: number | null;
    likeCount: number;
    timeStamp: string;
    isLiked?: boolean;
}

// ============================================
// Reaction Types
// ============================================

export interface LikeResponse {
    postId: number | null;
    commentId: number | null;
    userId: number;
    isLiked: boolean;
    likeCount: number;
}

// ============================================
// Save & Share Types
// ============================================

export interface SavedPostResponse {
    postId: number;
    userId: number;
    isSaved: boolean;
}

export interface SharePostRequest {
    conversationId: string;
    message?: string;
}

export interface SharePostResponse {
    messageId: number;
    postId: number;
    conversationId: string;
    senderId: number;
    senderName: string;
    message: string | null;
    messageType: MessageType;
    timestamp: string;
}

// ============================================
// Post Search Params
// ============================================

export interface PostSearchParams {
    page?: number;
    size?: number;
}

