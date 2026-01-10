import type { Conversation, ConversationsResponse } from '../types/message.types';

/**
 * Mock inbox data matching Figma design
 */
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'thread-huong',
    participant: {
      id: 'user-huong',
      displayName: 'Lê Thị Hương',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    },
    lastMessage: {
      content: 'Wow, cảm ơn bạn! Mình sẽ xem ngay 👍',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isRead: false,
    },
    unreadCount: 1,
    timeLabel: '10:35',
  },
  {
    id: 'conv-1',
    participant: {
      id: 'user-1',
      displayName: 'Nguyễn Minh Anh',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    },
    lastMessage: {
      content: 'Cuối tuần này đi cà phê không?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: false,
    },
    unreadCount: 2,
    timeLabel: '10:30',
  },
  {
    id: 'conv-2',
    participant: {
      id: 'user-2',
      displayName: 'Trần Văn Hùng',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    lastMessage: {
      content: 'Địa chỉ quán phở hôm qua là ở đâu vậy?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
    },
    unreadCount: 1,
    timeLabel: '08:45',
  },
  {
    id: 'conv-3',
    participant: {
      id: 'user-3',
      displayName: 'Lê Thị Mai',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
    lastMessage: {
      content: 'Ok, mình sẽ đến đúng giờ nhé!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    unreadCount: 0,
    timeLabel: 'Hôm qua',
  },
  {
    id: 'conv-4',
    participant: {
      id: 'user-4',
      displayName: 'Phạm Quốc Bảo',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    },
    lastMessage: {
      content: 'Cảm ơn bạn đã giới thiệu quán đó!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    unreadCount: 0,
    timeLabel: '2 ngày',
  },
  {
    id: 'conv-5',
    participant: {
      id: 'user-5',
      displayName: 'Hoàng Thị Lan',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    },
    lastMessage: {
      content: 'Hẹn gặp lại cuối tuần sau nhé 👋',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    unreadCount: 0,
    timeLabel: '3 ngày',
  },
  {
    id: 'conv-6',
    participant: {
      id: 'user-6',
      displayName: 'Võ Minh Tuấn',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    },
    lastMessage: {
      content: 'Mình đã gửi link nhóm cho bạn rồi',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: false,
    },
    unreadCount: 3,
    timeLabel: '3 ngày',
  },
  {
    id: 'conv-7',
    participant: {
      id: 'user-7',
      displayName: 'Đặng Thùy Dung',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    },
    lastMessage: {
      content: 'Review quán đó được không?',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    unreadCount: 0,
    timeLabel: '4 ngày',
  },
  {
    id: 'conv-8',
    participant: {
      id: 'user-8',
      displayName: 'Ngô Thanh Tùng',
    },
    lastMessage: {
      content: 'Mình book bàn lúc 7h tối nhé',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    unreadCount: 0,
    timeLabel: '5 ngày',
  },
];

/**
 * Simulated API delay
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock API service for inbox conversations
 */
export const inboxService = {
  getConversations: async (params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<ConversationsResponse> => {
    await delay(300);

    const { page, limit, search } = params;
    
    let filteredData = MOCK_CONVERSATIONS;
    
    // Filter by search query if provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredData = MOCK_CONVERSATIONS.filter(
        (conv) =>
          conv.participant.displayName.toLowerCase().includes(searchLower) ||
          conv.lastMessage.content.toLowerCase().includes(searchLower)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        hasMore: endIndex < filteredData.length,
      },
    };
  },
};
