/**
 * Mock Profile Posts Service
 */

import type { ProfilePost } from '../types';

const mockProfilePosts: Record<string, ProfilePost[]> = {
  'user-1': [
    {
      id: 'post-1',
      author: {
        id: 'user-1',
        name: 'Nguyễn Minh Anh',
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      },
      content:
        'Một buổi sáng yên bình, cà phê thơm và những câu chuyện chưa kể.',
      imageUrl:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
      createdAt: '2026-01-12T07:30:00Z',
      locations: [
        { id: 'loc-1', name: 'The Coffee House' },
        { id: 'loc-2', name: 'Highlands Coffee' },
      ],
      reactions: {
        likes: 128,
        comments: 24,
        shares: 6,
        isLiked: true,
      },
    },
    {
      id: 'post-2',
      author: {
        id: 'user-1',
        name: 'Nguyễn Minh Anh',
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      },
      content:
        'Chuyến đi ngắn nhưng đủ để nạp năng lượng cho cả tuần.',
      imageUrl:
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      createdAt: '2026-01-10T13:05:00Z',
      locations: [{ id: 'loc-3', name: 'Phố đi bộ Nguyễn Huệ' }],
      reactions: {
        likes: 76,
        comments: 11,
        shares: 2,
        isLiked: false,
      },
    },
  ],
  'user-huong': [
    {
      id: 'post-3',
      author: {
        id: 'user-huong',
        name: 'Lê Thị Hương',
        avatarUrl:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      },
      content: 'Góc nhỏ quen thuộc và một chút bình yên.',
      imageUrl:
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      createdAt: '2026-01-11T09:20:00Z',
      locations: [{ id: 'loc-4', name: 'Phố cổ Hà Nội' }],
      reactions: {
        likes: 54,
        comments: 5,
        shares: 1,
        isLiked: false,
      },
    },
  ],
};

export function getMockProfilePosts(userId: string): ProfilePost[] {
  return mockProfilePosts[userId] ?? [];
}

export async function fetchProfilePosts(userId: string): Promise<ProfilePost[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getMockProfilePosts(userId);
}
