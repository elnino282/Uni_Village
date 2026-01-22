/**
 * Media Service
 * Provides sent media data using Firebase RTDB + Storage
 */
import { get, ref as rtdbRef } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';

import { database, storage } from '@/lib/firebase';
import type { MediaItem, SentMediaResponse } from '../types';

interface MediaMessage {
    id: string;
    imageUrl?: string;
    createdAt?: number;
}

function mapMediaToItem(media: MediaMessage, index: number): MediaItem {
    const timestamp = media.createdAt ?? Date.now();

    return {
        id: media.id || `media-${index}`,
        url: media.imageUrl || '',
        type: 'image',
        width: 400,
        height: 400,
        sentAt: new Date(timestamp).toISOString(),
    };
}

export async function getMediaMessages(conversationId: string): Promise<MediaMessage[]> {
    try {
        const messagesRef = rtdbRef(database, `messages/${conversationId}`);
        const snapshot = await get(messagesRef);
        const mediaMessages: MediaMessage[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const data = child.val();
                if (data && data.type === 'image' && data.imageUrl) {
                    mediaMessages.push({
                        id: child.key || `media-${mediaMessages.length}`,
                        imageUrl: data.imageUrl,
                        createdAt: data.createdAt,
                    });
                }
            });
        }

        mediaMessages.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

        return mediaMessages;
    } catch (error) {
        console.error('[Media Service] Error fetching media:', error);
        return [];
    }
}

async function getAllMedia(conversationId: string): Promise<MediaItem[]> {
    const mediaMessages = await getMediaMessages(conversationId);
    return mediaMessages.map((media, index) => mapMediaToItem(media, index));
}

export async function uploadChatImage(
    conversationId: string,
    file: { uri: string; name: string; type: string }
): Promise<string> {
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const storagePath = `chat/${conversationId}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, storagePath);

    await uploadBytes(fileRef, blob, { contentType: file.type });

    return getDownloadURL(fileRef);
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
