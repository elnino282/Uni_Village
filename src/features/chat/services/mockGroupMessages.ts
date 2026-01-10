/**
 * Mock group messages data for chat feature
 */
import type { Message } from '../types';

/**
 * Mock group messages database
 */
const MOCK_GROUP_MESSAGES: Record<string, Message[]> = {
  'group-dalat': [
    {
      id: 'gmsg-1',
      type: 'text',
      sender: 'other',
      senderName: 'Minh Anh',
      senderAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      text: 'Mọi người ơi, mình tìm được tour cà phê này hay lắm! ☕',
      createdAt: '2024-10-12T09:30:00Z',
      timeLabel: '09:30',
    },
    {
      id: 'gmsg-2',
      type: 'text',
      sender: 'other',
      senderName: 'Văn Đức',
      senderAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      text: 'Ơ hay quá! Giá bao nhiêu vậy bạn?',
      createdAt: '2024-10-12T09:31:00Z',
      timeLabel: '09:31',
    },
    {
      id: 'gmsg-3',
      type: 'text',
      sender: 'me',
      text: 'Tour này mình đi rồi, recommend luôn nè!',
      createdAt: '2024-10-12T09:32:00Z',
      timeLabel: '09:32',
      status: 'sent',
    },
    {
      id: 'gmsg-4',
      type: 'sharedCard',
      sender: 'me',
      card: {
        id: 'card-coffee-tour',
        title: 'Tour Cà Phê Sài Gòn',
        imageUrl:
          'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop',
        ctaText: 'Xem chi tiết →',
        route: '/itinerary/coffee-tour',
      },
      createdAt: '2024-10-12T09:33:00Z',
      timeLabel: '09:33',
      status: 'sent',
    },
    {
      id: 'gmsg-5',
      type: 'text',
      sender: 'other',
      senderName: 'Minh Anh',
      senderAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      text: 'Wow, cảm ơn bạn nhé! Để mình xem thử 😊',
      createdAt: '2024-10-12T09:35:00Z',
      timeLabel: '09:35',
    },
    {
      id: 'gmsg-6',
      type: 'text',
      sender: 'other',
      senderName: 'Văn Đức',
      senderAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      text: 'Mình đặt luôn đi mọi người! Có ai muốn đi cùng không?',
      createdAt: '2024-10-12T09:36:00Z',
      timeLabel: '09:36',
    },
  ],
  // Reuse Dalat messages for channel-1 (Du lịch Đà Lạt 2024)
  'channel-1': [
    {
      id: 'ch1-msg-1',
      type: 'text',
      sender: 'other',
      senderName: 'Minh Anh',
      senderAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      text: 'Mọi người chuẩn bị đồ ấm nhé, Đà Lạt đang lạnh lắm! 🥶',
      createdAt: '2024-10-12T10:45:00Z',
      timeLabel: '10:45',
    },
    {
      id: 'ch1-msg-2',
      type: 'text',
      sender: 'other',
      senderName: 'Văn Đức',
      senderAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      text: 'Mình đã book khách sạn rồi nhé, view đẹp lắm!',
      createdAt: '2024-10-12T10:46:00Z',
      timeLabel: '10:46',
    },
    {
      id: 'ch1-msg-3',
      type: 'text',
      sender: 'me',
      text: 'Nice! Khách sạn nào vậy bạn?',
      createdAt: '2024-10-12T10:47:00Z',
      timeLabel: '10:47',
      status: 'sent',
    },
    {
      id: 'ch1-msg-4',
      type: 'sharedCard',
      sender: 'me',
      card: {
        id: 'card-coffee-tour',
        title: 'Tour Cà Phê Sài Gòn',
        imageUrl:
          'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop',
        ctaText: 'Xem chi tiết →',
        route: '/itinerary/coffee-tour',
      },
      createdAt: '2024-10-12T10:48:00Z',
      timeLabel: '10:48',
      status: 'sent',
    },
    {
      id: 'ch1-msg-5',
      type: 'text',
      sender: 'other',
      senderName: 'Thu Hà',
      senderAvatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      text: 'Tour này hay quá! Mình cũng muốn tham gia 🙋‍♀️',
      createdAt: '2024-10-12T10:50:00Z',
      timeLabel: '10:50',
    },
  ],
  'channel-2': [
    {
      id: 'ch2-msg-1',
      type: 'text',
      sender: 'other',
      senderName: 'Văn Hùng',
      senderAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      text: 'Ai có tài liệu Writing Task 2 cho mình xin với 📚',
      createdAt: '2024-10-12T10:15:00Z',
      timeLabel: '10:15',
    },
    {
      id: 'ch2-msg-2',
      type: 'text',
      sender: 'me',
      text: 'Mình có link drive tài liệu nè, để mình share nhé!',
      createdAt: '2024-10-12T10:16:00Z',
      timeLabel: '10:16',
      status: 'sent',
    },
  ],
  'channel-3': [
    {
      id: 'ch3-msg-1',
      type: 'text',
      sender: 'other',
      senderName: 'Thị Mai',
      senderAvatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      text: 'Quán bún bò ở Quận 3 ngon lắm mọi người ơi! 🍜',
      createdAt: '2024-10-12T08:30:00Z',
      timeLabel: '08:30',
    },
  ],
  'group-saigon': [
    {
      id: 'sgmsg-1',
      type: 'text',
      sender: 'other',
      senderName: 'Thu Hà',
      senderAvatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      text: 'Cuối tuần này ai đi Bến Thành không?',
      createdAt: '2024-10-12T10:00:00Z',
      timeLabel: '10:00',
    },
  ],
};

/**
 * Get messages for a group thread
 * @param threadId - Thread identifier
 * @returns Array of messages
 */
export function getGroupMessages(threadId: string): Message[] {
  return MOCK_GROUP_MESSAGES[threadId] || [];
}

/**
 * Simulate async fetch for group messages
 */
export async function fetchGroupMessages(threadId: string): Promise<{
  messages: Message[];
  hasMore: boolean;
}> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));
  
  const messages = getGroupMessages(threadId);
  return {
    messages,
    hasMore: false,
  };
}
