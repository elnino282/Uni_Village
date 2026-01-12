/**
 * Mock Saved Posts Service
 */

import type { ProfilePost } from '../types';

const mockSavedPosts: Record<string, ProfilePost[]> = {
  'user-1': [
    {
      id: 'saved-1',
      author: {
        id: 'user-5',
        name: 'Hoàng Minh',
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      },
      content: 'Một nơi lý tưởng cho buổi hẹn chiều cuối tuần.',
      imageUrl:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
      createdAt: '2026-01-09T16:00:00Z',
      locations: [{ id: 'loc-5', name: 'Katinat Saigon Kafe' }],
      reactions: {
        likes: 210,
        comments: 31,
        shares: 9,
        isLiked: false,
      },
    },
  ],
  'user-huong': [],
};

export function getMockSavedPosts(userId: string): ProfilePost[] {
  return mockSavedPosts[userId] ?? [];
}

export async function fetchSavedPosts(userId: string): Promise<ProfilePost[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getMockSavedPosts(userId);
}
