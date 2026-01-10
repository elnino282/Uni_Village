/**
 * Mock messages data for chat feature
 * Matches the Figma screenshot conversation
 */
import type { Message, MessagesResponse } from '../types';

/**
 * Mock messages database by thread ID
 */
const MOCK_MESSAGES: Record<string, Message[]> = {
  'thread-huong': [
    {
      id: 'msg-1',
      type: 'text',
      sender: 'other',
      text: 'Chào bạn! Mình thấy bạn check-in ở The Coffee House hôm qua',
      createdAt: '2026-01-10T10:30:00.000Z',
      timeLabel: '10:30',
    },
    {
      id: 'msg-2',
      type: 'text',
      sender: 'other',
      text: 'Quán đó view đẹp không?',
      createdAt: '2026-01-10T10:31:00.000Z',
      timeLabel: '10:31',
    },
    {
      id: 'msg-3',
      type: 'text',
      sender: 'me',
      text: 'Chào bạn! Đúng rồi, view rất đẹp luôn 😊',
      createdAt: '2026-01-10T10:32:00.000Z',
      timeLabel: '10:32',
      status: 'delivered',
    },
    {
      id: 'msg-4',
      type: 'text',
      sender: 'me',
      text: 'Mình có lưu vào lịch trình rồi, bạn muốn xem không?',
      createdAt: '2026-01-10T10:33:00.000Z',
      timeLabel: '10:33',
      status: 'delivered',
    },
    {
      id: 'msg-5',
      type: 'sharedCard',
      sender: 'me',
      createdAt: '2026-01-10T10:34:00.000Z',
      timeLabel: '10:34',
      status: 'delivered',
      card: {
        id: 'itinerary-coffee-tour',
        title: 'Tour Cà Phê làng đại học',
        imageUrl:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
        ctaText: 'Xem chi tiết →',
        route: '/itinerary/itinerary-coffee-tour',
      },
    },
    {
      id: 'msg-6',
      type: 'text',
      sender: 'other',
      text: 'Wow, cảm ơn bạn!\nMình sẽ xem ngay 👍',
      createdAt: '2026-01-10T10:35:00.000Z',
      timeLabel: '10:35',
    },
  ],
  // Default conversation for other threads
  'conv-1': [
    {
      id: 'msg-c1-1',
      type: 'text',
      sender: 'other',
      text: 'Cuối tuần này đi cà phê không?',
      createdAt: '2026-01-10T10:30:00.000Z',
      timeLabel: '10:30',
    },
  ],
  'conv-2': [
    {
      id: 'msg-c2-1',
      type: 'text',
      sender: 'other',
      text: 'Địa chỉ quán phở hôm qua là ở đâu vậy?',
      createdAt: '2026-01-10T08:45:00.000Z',
      timeLabel: '08:45',
    },
  ],
};

/**
 * Get messages for a thread
 * @param threadId - Thread identifier
 * @returns Messages list
 */
export function getMessages(threadId: string): MessagesResponse {
  const messages = MOCK_MESSAGES[threadId] ?? [];
  return {
    messages,
    hasMore: false,
  };
}

/**
 * Simulate async fetch
 */
export async function fetchMessages(threadId: string): Promise<MessagesResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));
  return getMessages(threadId);
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format current time as label
 */
export function getCurrentTimeLabel(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}
