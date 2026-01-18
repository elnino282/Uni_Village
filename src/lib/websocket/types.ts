import type { MessageResponse } from '@/shared/types/backend.types';

export type WebSocketEventType =
    | 'SEND'
    | 'EDIT'
    | 'UNSEND'
    | 'SEEN'
    | 'DELIVERED'
    | 'TYPING'
    | 'CHANNEL_CHANGED'
    | 'COMMENT_CHANGED'
    | 'REACTION_CHANGED'
    | 'POST_CHANGED'
    | 'SEND_JOIN_REQUEST'
    | 'ACCEPT_JOIN_REQUEST'
    | 'REJECT_JOIN_REQUEST';

export interface WebSocketMessage<T = unknown> {
    eventType: WebSocketEventType;
    data: T;
}

export interface TypingEvent {
    userId: number;
    userName: string;
    conversationId: string;
    isTyping: boolean;
}

export interface ReadReceiptEvent {
    userId: number;
    conversationId: string;
    messageId: number;
}

export interface MessageEvent {
    message: MessageResponse;
}

export type WebSocketTopic =
    | { type: 'conversation'; conversationId: string }
    | { type: 'channel'; conversationId: string }
    | { type: 'post-comments'; postId: number }
    | { type: 'post-reactions'; postId: number }
    | { type: 'user-queue' };

export interface WebSocketConfig {
    url: string;
    accessToken: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: any) => void;
}

export interface StompSubscription {
    id: string;
    topic: string;
    unsubscribe: () => void;
}
