/**
 * Mock Profile Data Service
 * Temporary mock data - will be replaced with Firebase later
 */

import type { Profile } from '../types';

export const mockProfile: Profile = {
    id: 'user-001',
    userId: 'user-001',
    username: 'saidepchieu',
    displayName: 'Lãng tử',
    bio: 'Why do we fall? So that we can learn to pick ourselves up.',
    avatarUrl: undefined,
    coverUrl: undefined,
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

export function getMockProfile(): Promise<Profile> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockProfile);
        }, 300);
    });
}
