/**
 * Mock group thread data for chat feature
 */
import type { GroupThread, PinnedMessage, ThreadResponse } from '../types';

/**
 * Mock pinned messages
 */
const MOCK_PINNED_MESSAGES: Record<string, PinnedMessage> = {
  'pin-dalat': {
    id: 'pin-dalat',
    text: 'Lịch trình chốt ngày 15/10. Đặt vé sớm!',
    pinnedBy: 'user-minhanh',
    pinnedAt: '2024-10-10T10:00:00Z',
  },
};

/**
 * Dynamic group threads storage (for newly created channels)
 */
const DYNAMIC_GROUP_THREADS: Record<string, GroupThread> = {};

/**
 * Add a dynamically created group thread
 */
export function addDynamicGroupThread(id: string, thread: GroupThread): void {
  DYNAMIC_GROUP_THREADS[id] = thread;
}

/**
 * Mock group threads database
 * Note: Channel IDs from community feature also map to group threads
 */
const MOCK_GROUP_THREADS: Record<string, GroupThread> = {
  'group-dalat': {
    id: 'group-dalat',
    type: 'group',
    name: 'Du lịch Đà Lạt',
    avatarUrl:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop',
    memberCount: 8,
    onlineCount: 3,
    pinnedMessage: MOCK_PINNED_MESSAGES['pin-dalat'],
  },
  // Map channel-1 to the Dalat group (for seamless navigation from ChannelList)
  'channel-1': {
    id: 'channel-1',
    type: 'group',
    name: 'Du lịch Đà Lạt 2024',
    avatarUrl:
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=100&h=100&fit=crop',
    memberCount: 24,
    onlineCount: 5,
    pinnedMessage: MOCK_PINNED_MESSAGES['pin-dalat'],
  },
  'channel-2': {
    id: 'channel-2',
    type: 'group',
    name: 'Nhóm học tập IELTS',
    avatarUrl:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=100&h=100&fit=crop',
    memberCount: 156,
    onlineCount: 23,
  },
  'channel-3': {
    id: 'channel-3',
    type: 'group',
    name: 'Foodie Sài Gòn',
    avatarUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop',
    memberCount: 89,
    onlineCount: 12,
  },
  'channel-4': {
    id: 'channel-4',
    type: 'group',
    name: 'Cộng đồng Dev ReactNative',
    avatarUrl:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop',
    memberCount: 342,
    onlineCount: 45,
  },
  'channel-5': {
    id: 'channel-5',
    type: 'group',
    name: 'Gym & Fitness TPHCM',
    avatarUrl:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop',
    memberCount: 67,
    onlineCount: 8,
  },
  'channel-6': {
    id: 'channel-6',
    type: 'group',
    name: 'Review Phim & Series',
    avatarUrl:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&h=100&fit=crop',
    memberCount: 128,
    onlineCount: 15,
  },
  'channel-7': {
    id: 'channel-7',
    type: 'group',
    name: 'Săn deal & Voucher',
    avatarUrl:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&h=100&fit=crop',
    memberCount: 456,
    onlineCount: 67,
  },
  'group-saigon': {
    id: 'group-saigon',
    type: 'group',
    name: 'Khám phá Sài Gòn',
    avatarUrl:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=100&h=100&fit=crop',
    memberCount: 12,
    onlineCount: 5,
  },
  'group-hanoi': {
    id: 'group-hanoi',
    type: 'group',
    name: 'Hà Nội 36 Phố Phường',
    avatarUrl:
      'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=100&h=100&fit=crop',
    memberCount: 15,
    onlineCount: 7,
  },
};

/**
 * Get group thread by ID
 * @param threadId - Thread identifier
 * @returns Group thread info or null
 */
export function getGroupThread(threadId: string): GroupThread | null {
  // Check if it's in the mock database
  if (MOCK_GROUP_THREADS[threadId]) {
    return MOCK_GROUP_THREADS[threadId];
  }
  
  // Check if it's in the dynamic database (newly created channels)
  if (DYNAMIC_GROUP_THREADS[threadId]) {
    return DYNAMIC_GROUP_THREADS[threadId];
  }
  
  // Handle dynamically created channels (from createChannel mutation)
  if (threadId.startsWith('channel-') && !MOCK_GROUP_THREADS[threadId]) {
    // Create a default thread for newly created channels
    return {
      id: threadId,
      type: 'group',
      name: 'Channel mới',
      avatarUrl: undefined,
      memberCount: 1,
      onlineCount: 1,
    };
  }
  
  return null;
}

/**
 * Simulate async fetch for group thread
 */
export async function fetchGroupThread(
  threadId: string
): Promise<ThreadResponse | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const thread = getGroupThread(threadId);
  if (thread) {
    return { thread };
  }
  return null;
}

/**
 * Check if a thread ID belongs to a group
 * Matches both 'group-' and 'channel-' prefixes
 */
export function isGroupThreadId(threadId: string): boolean {
  return threadId.startsWith('group-') || threadId.startsWith('channel-');
}
