/**
 * Media Service
 * Provides sent media data using Firebase
 */
import type { MediaItem, SentMediaResponse } from '../types';
import { getMediaMessages } from './firebaseChat.service';

function mapMediaToItem(media: { id: string; imageUrl?: string; createdAt: string }, index: number): MediaItem {
    return {
        id: media.id || `media-${index}`,
        url: media.imageUrl || '',
        type: 'image',
        width: 400,
        height: 400,
        sentAt: media.createdAt || new Date().toISOString(),
    };
}

async function getAllMedia(conversationId: string): Promise<MediaItem[]> {
    try {
        const mediaMessages = await getMediaMessages(conversationId);
        return mediaMessages.map((media, index) => mapMediaToItem(media, index));
    } catch (error) {
        console.error('[Media Service] Error fetching media:', error);
        return [];
    }
}

export async function fetchSentMediaPreview(conversationId: string): Promise<MediaItem[]> {
    const allMedia = await getAllMedia(conversationId);
    return allMedia.slice(0, 6);
}

export async function fetchSentMedia(
    conversationId: string,
    page: number = 1,
    limit: number = 20
): Promise<SentMediaResponse> {
    const allMedia = await getAllMedia(conversationId);

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
