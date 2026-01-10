/**
 * Mock Friends Data
 * Mock data for friend selection in channel creation
 */
import type { FriendPreview } from '../types/channel.types';

/**
 * Mock friends list for member selection
 * Matches Figma node 499:1729
 */
export const MOCK_FRIENDS: FriendPreview[] = [
  {
    id: 'friend-1',
    displayName: 'Minh Anh',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    isOnline: true,
    statusText: 'Đang hoạt động',
  },
  {
    id: 'friend-2',
    displayName: 'Văn Đức',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isOnline: true,
    statusText: 'Đang hoạt động',
  },
  {
    id: 'friend-3',
    displayName: 'Thu Hà',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    isOnline: false,
    statusText: 'Không hoạt động',
  },
  {
    id: 'friend-4',
    displayName: 'Minh Tuấn',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    isOnline: true,
    statusText: 'Đang hoạt động',
  },
  {
    id: 'friend-5',
    displayName: 'Hương Giang',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    isOnline: false,
    statusText: 'Không hoạt động',
  },
  {
    id: 'friend-6',
    displayName: 'Đức Anh',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    isOnline: true,
    statusText: 'Đang hoạt động',
  },
  {
    id: 'friend-7',
    displayName: 'Thanh Tâm',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    isOnline: false,
    statusText: 'Không hoạt động',
  },
  {
    id: 'friend-8',
    displayName: 'Hoàng Nam',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    isOnline: true,
    statusText: 'Đang hoạt động',
  },
  {
    id: 'friend-9',
    displayName: 'Linh Chi',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    isOnline: false,
    statusText: 'Không hoạt động',
  },
  {
    id: 'friend-10',
    displayName: 'Quốc Bảo',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
    isOnline: true,
    statusText: 'Đang hoạt động',
  },
];

/**
 * Fetch friends with optional search filter
 */
export async function fetchFriends(searchQuery?: string): Promise<FriendPreview[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!searchQuery) {
    return MOCK_FRIENDS;
  }

  const query = searchQuery.toLowerCase();
  return MOCK_FRIENDS.filter((friend) =>
    friend.displayName.toLowerCase().includes(query)
  );
}
