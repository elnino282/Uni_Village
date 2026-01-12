/**
 * Mock Thread Info Service
 * Provides mock data for thread info screen
 */

import type { ThreadInfo } from '../types';

/**
 * Mock thread info data
 */
const mockThreadInfoData: Record<string, ThreadInfo> = {
  'thread-huong': {
    threadId: 'thread-huong',
    peerId: 'user-huong',
    peerName: 'Lê Thị Hương',
    peerAvatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    isMuted: false,
    isBlocked: false,
    sentMediaCount: 12,
  },
  'conv-1': {
    threadId: 'conv-1',
    peerId: 'user-1',
    peerName: 'Nguyễn Minh Anh',
    peerAvatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    isMuted: true,
    isBlocked: false,
    sentMediaCount: 5,
  },
  'conv-2': {
    threadId: 'conv-2',
    peerId: 'user-2',
    peerName: 'Trần Văn Hằng',
    peerAvatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    isMuted: false,
    isBlocked: false,
    sentMediaCount: 8,
  },
  'conv-3': {
    threadId: 'conv-3',
    peerId: 'user-3',
    peerName: 'Lê Thị Mai',
    peerAvatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    isMuted: false,
    isBlocked: false,
    sentMediaCount: 3,
  },
};

/**
 * Get thread info by ID
 */
export function getThreadInfo(threadId: string): ThreadInfo | null {
  return mockThreadInfoData[threadId] || null;
}

/**
 * Simulate fetching thread info from API
 */
export async function fetchThreadInfo(threadId: string): Promise<ThreadInfo> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const info = getThreadInfo(threadId);
  if (!info) {
    throw new Error(`Thread info not found for thread: ${threadId}`);
  }

  return info;
}

/**
 * Toggle mute status for a thread
 */
export async function toggleThreadMute(threadId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const info = mockThreadInfoData[threadId];
  if (info) {
    info.isMuted = !info.isMuted;
    return info.isMuted;
  }

  return false;
}

/**
 * Block user in thread
 */
export async function blockThreadUser(threadId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const info = mockThreadInfoData[threadId];
  if (info) {
    info.isBlocked = true;
  }
}

/**
 * Archive thread
 */
export async function archiveThread(threadId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.log('Thread archived:', threadId);
}

/**
 * Delete thread history
 */
export async function deleteThreadHistory(threadId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.log('Thread history deleted:', threadId);
}

/**
 * Report thread user
 */
export async function reportThreadUser(threadId: string, reason?: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.log('User reported:', threadId, reason);
}
