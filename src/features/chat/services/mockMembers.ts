/**
 * Mock group members and suggested users data
 */
import type { GroupMember, UserPreview } from '../types';

/**
 * Mock group members by thread ID
 */
const MOCK_GROUP_MEMBERS: Record<string, GroupMember[]> = {
  'group-dalat': [
    {
      id: 'user-me',
      displayName: 'Bạn',
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      isOnline: true,
      role: 'admin',
    },
    {
      id: 'user-minhanh',
      displayName: 'Minh Anh',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      isOnline: true,
      role: 'member',
    },
    {
      id: 'user-vanduc',
      displayName: 'Văn Đức',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      isOnline: true,
      role: 'member',
    },
    {
      id: 'user-thuha',
      displayName: 'Thu Hà',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      isOnline: false,
      role: 'member',
    },
    {
      id: 'user-hoangnam',
      displayName: 'Hoàng Nam',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      isOnline: false,
      role: 'member',
    },
    {
      id: 'user-ngoclan',
      displayName: 'Ngọc Lan',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      isOnline: false,
      role: 'member',
    },
    {
      id: 'user-quangminh',
      displayName: 'Quang Minh',
      avatarUrl:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
      isOnline: false,
      role: 'member',
    },
    {
      id: 'user-maitrang',
      displayName: 'Mai Trang',
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      isOnline: false,
      role: 'member',
    },
  ],
};

/**
 * Mock suggested users (for adding to group)
 */
const MOCK_SUGGESTED_USERS: UserPreview[] = [
  {
    id: 'sug-user-1',
    displayName: 'Nguyễn Văn An',
    avatarUrl:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face',
    phone: '0901234567',
  },
  {
    id: 'sug-user-2',
    displayName: 'Trần Thị Bích',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    phone: '0912345678',
  },
  {
    id: 'sug-user-3',
    displayName: 'Phạm Minh Châu',
    avatarUrl:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face',
    phone: '0923456789',
  },
  {
    id: 'sug-user-4',
    displayName: 'Lê Quốc Đạt',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    phone: '0934567890',
  },
  {
    id: 'sug-user-5',
    displayName: 'Hoàng Thu Hương',
    avatarUrl:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&crop=face',
    phone: '0945678901',
  },
];

/**
 * Get members for a group thread
 */
export function getGroupMembers(threadId: string): GroupMember[] {
  return MOCK_GROUP_MEMBERS[threadId] || [];
}

/**
 * Simulate async fetch for group members
 */
export async function fetchGroupMembers(threadId: string): Promise<GroupMember[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getGroupMembers(threadId);
}

/**
 * Get suggested users for adding to group
 */
export function getSuggestedUsers(): UserPreview[] {
  return MOCK_SUGGESTED_USERS;
}

/**
 * Simulate async fetch for suggested users
 */
export async function fetchSuggestedUsers(): Promise<UserPreview[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getSuggestedUsers();
}

/**
 * Search users by phone number (mock)
 */
export async function searchUsersByPhone(query: string): Promise<UserPreview[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  if (!query.trim()) {
    return getSuggestedUsers();
  }
  
  return MOCK_SUGGESTED_USERS.filter(
    (user) => user.phone?.includes(query) || user.displayName.toLowerCase().includes(query.toLowerCase())
  );
}
