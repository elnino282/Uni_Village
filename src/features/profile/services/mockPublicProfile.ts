/**
 * Mock Public Profile Service
 * Provides mock data for public profile screen
 */

import type { PublicProfile } from '../types';

const mockPublicProfiles: Record<string, PublicProfile> = {
  'user-1': {
    id: 'user-1',
    userId: 'user-1',
    username: 'saidepchieu',
    displayName: 'Nguyễn Minh Anh',
    bio: 'Why do we fall? So that we can learn to pick ourselves up.',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    coverUrl: undefined,
    postsCount: 12,
    followersCount: 328,
    followingCount: 180,
    isFollowing: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    threadId: 'conv-1',
  },
  'user-huong': {
    id: 'user-huong',
    userId: 'user-huong',
    username: 'huongle',
    displayName: 'Lê Thị Hương',
    bio: 'Một ngày thật đẹp để bắt đầu điều mới.',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    coverUrl: undefined,
    postsCount: 4,
    followersCount: 95,
    followingCount: 120,
    isFollowing: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    threadId: 'thread-huong',
  },
};

export function getMockPublicProfile(userId: string): PublicProfile | null {
  return mockPublicProfiles[userId] ?? null;
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfile> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const profile = getMockPublicProfile(userId);
  if (!profile) {
    throw new Error(`Public profile not found for user: ${userId}`);
  }

  return profile;
}
