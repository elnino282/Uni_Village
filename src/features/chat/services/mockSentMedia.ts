/**
 * Mock Sent Media Service
 * Provides mock data for sent media gallery
 */

import type { MediaItem, SentMediaResponse } from '../types';

/**
 * Mock sent media data by thread ID
 */
const mockSentMediaData: Record<string, MediaItem[]> = {
  'thread-huong': [
    {
      id: 'media-1',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-12T10:30:00Z',
    },
    {
      id: 'media-2',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-11T15:45:00Z',
    },
    {
      id: 'media-3',
      url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-10T09:20:00Z',
    },
    {
      id: 'media-4',
      url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-09T14:00:00Z',
    },
    {
      id: 'media-5',
      url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-08T11:30:00Z',
    },
    {
      id: 'media-6',
      url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-07T16:15:00Z',
    },
    {
      id: 'media-7',
      url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-06T12:00:00Z',
    },
    {
      id: 'media-8',
      url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-05T18:30:00Z',
    },
    {
      id: 'media-9',
      url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-04T09:45:00Z',
    },
    {
      id: 'media-10',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-03T14:20:00Z',
    },
    {
      id: 'media-11',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-02T11:00:00Z',
    },
    {
      id: 'media-12',
      url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-01T08:30:00Z',
    },
  ],
  'conv-1': [
    {
      id: 'media-21',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'media-22',
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-09T15:00:00Z',
    },
    {
      id: 'media-23',
      url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-08T12:00:00Z',
    },
    {
      id: 'media-24',
      url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-07T09:00:00Z',
    },
    {
      id: 'media-25',
      url: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400&h=400&fit=crop',
      type: 'image',
      width: 400,
      height: 400,
      sentAt: '2026-01-06T14:00:00Z',
    },
  ],
};

/**
 * Get sent media for a thread
 */
export function getSentMedia(threadId: string): MediaItem[] {
  return mockSentMediaData[threadId] || [];
}

/**
 * Get sent media preview (first 6 items)
 */
export function getSentMediaPreview(threadId: string): MediaItem[] {
  const media = getSentMedia(threadId);
  return media.slice(0, 6);
}

/**
 * Simulate fetching sent media from API with pagination
 */
export async function fetchSentMedia(
  threadId: string,
  page: number = 1,
  limit: number = 20
): Promise<SentMediaResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const allMedia = getSentMedia(threadId);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMedia = allMedia.slice(startIndex, endIndex);

  return {
    data: paginatedMedia,
    pagination: {
      page,
      limit,
      total: allMedia.length,
      hasMore: endIndex < allMedia.length,
    },
  };
}

/**
 * Fetch sent media preview (first 6 items)
 */
export async function fetchSentMediaPreview(threadId: string): Promise<MediaItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return getSentMediaPreview(threadId);
}
