/**
 * Post Types
 */

import type { User } from '@/features/auth';
import type { BaseEntity } from '@/shared/types';

export interface Post extends BaseEntity {
    content: string;
    imageUrls?: string[];
    author: User;
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    location?: {
        name: string;
        lat: number;
        lng: number;
    };
}

export interface CreatePostRequest {
    content: string;
    imageUrls?: string[];
    location?: {
        name: string;
        lat: number;
        lng: number;
    };
}

export interface UpdatePostRequest {
    content?: string;
    imageUrls?: string[];
}
