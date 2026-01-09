import type { Channel, ChannelsResponse } from '../types/message.types';

/**
 * Mock channels data matching Figma design
 */
export const MOCK_CHANNELS: Channel[] = [
  {
    id: 'channel-1',
    name: 'Du lịch Đà Lạt 2024',
    avatarUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=100&h=100&fit=crop',
    memberCount: 24,
    lastMessage: {
      senderName: 'Minh Anh',
      content: 'Mọi người chuẩn bị đồ ấm nhé, Đà Lạt đang lạnh lắm!',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    unreadCount: 5,
    timeLabel: '10:45',
  },
  {
    id: 'channel-2',
    name: 'Nhóm học tập IELTS',
    avatarUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=100&h=100&fit=crop',
    memberCount: 156,
    lastMessage: {
      senderName: 'Văn Hùng',
      content: 'Ai có tài liệu Writing Task 2 cho mình xin với',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    unreadCount: 12,
    timeLabel: '10:15',
  },
  {
    id: 'channel-3',
    name: 'Foodie Sài Gòn',
    avatarUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop',
    memberCount: 89,
    lastMessage: {
      senderName: 'Thị Mai',
      content: 'Quán bún bò ở Quận 3 ngon lắm mọi người ơi!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    timeLabel: '08:30',
  },
  {
    id: 'channel-4',
    name: 'Cộng đồng Dev ReactNative',
    avatarUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop',
    memberCount: 342,
    lastMessage: {
      senderName: 'Quốc Bảo',
      content: 'Expo SDK 52 ra rồi, ai update chưa?',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    timeLabel: 'Hôm qua',
  },
  {
    id: 'channel-5',
    name: 'Gym & Fitness TPHCM',
    avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop',
    memberCount: 67,
    lastMessage: {
      senderName: 'Minh Tuấn',
      content: 'Có ai tập ở California Fitness không?',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 3,
    timeLabel: '2 ngày',
  },
  {
    id: 'channel-6',
    name: 'Review Phim & Series',
    avatarUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&h=100&fit=crop',
    memberCount: 128,
    lastMessage: {
      senderName: 'Thùy Dung',
      content: 'Squid Game mùa 2 hay quá đi!',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    timeLabel: '3 ngày',
  },
  {
    id: 'channel-7',
    name: 'Săn deal & Voucher',
    avatarUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&h=100&fit=crop',
    memberCount: 456,
    lastMessage: {
      senderName: 'Thanh Tùng',
      content: 'Shopee sale 12.12 nhiều deal ngon lắm!',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    timeLabel: '4 ngày',
  },
];

/**
 * Simulated API delay
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock API service for channels
 */
export const channelService = {
  getChannels: async (params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<ChannelsResponse> => {
    await delay(300);

    const { page, limit, search } = params;

    let filteredData = MOCK_CHANNELS;

    // Filter by search query if provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredData = MOCK_CHANNELS.filter(
        (channel) =>
          channel.name.toLowerCase().includes(searchLower) ||
          channel.lastMessage.content.toLowerCase().includes(searchLower) ||
          channel.lastMessage.senderName.toLowerCase().includes(searchLower)
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
