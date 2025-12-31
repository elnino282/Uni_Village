/**
 * Profile Types
 */

import type { BaseEntity } from '@/shared/types';

export interface Profile extends BaseEntity {
    userId: string;
    username: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    isFollowing?: boolean;
}

export interface UpdateProfileRequest {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
}
