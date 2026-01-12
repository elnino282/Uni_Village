/**
 * Mock thread data for chat feature
 */
import type { ChatThread, ThreadResponse } from '../types';

/**
 * Mock chat threads database
 */
const MOCK_THREADS: Record<string, ChatThread> = {
  'thread-huong': {
    id: 'thread-huong',
    type: 'dm',
    peer: {
      id: 'user-huong',
      displayName: 'Lê Thị Hương',
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    },
    onlineStatus: 'online',
    onlineStatusText: 'Đang hoạt động',
  },
  'conv-1': {
    id: 'conv-1',
    type: 'dm',
    peer: {
      id: 'user-1',
      displayName: 'Nguyễn Minh Anh',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    },
    onlineStatus: 'online',
    onlineStatusText: 'Đang hoạt động',
  },
  'conv-2': {
    id: 'conv-2',
    type: 'dm',
    peer: {
      id: 'user-2',
      displayName: 'Trần Văn Hằng',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    onlineStatus: 'offline',
    onlineStatusText: 'Hoạt động 2 giờ trước',
  },
  'conv-3': {
    id: 'conv-3',
    type: 'dm',
    peer: {
      id: 'user-3',
      displayName: 'Lê Thị Mai',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
    onlineStatus: 'away',
    onlineStatusText: 'Vắng mặt',
  },
};

/**
 * Get thread by ID
 * @param threadId - Thread identifier
 * @returns Thread info or fallback
 */
export function getThread(threadId: string): ThreadResponse {
  const thread = MOCK_THREADS[threadId];

  if (thread) {
    return { thread };
  }

  return {
    thread: {
      id: threadId,
      type: 'dm',
      peer: {
        id: `user-${threadId}`,
        displayName: 'Người dùng',
        avatarUrl: undefined,
      },
      onlineStatus: 'offline',
      onlineStatusText: 'Offline',
    },
  };
}

/**
 * Simulate async fetch
 */
export async function fetchThread(threadId: string): Promise<ThreadResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getThread(threadId);
}
