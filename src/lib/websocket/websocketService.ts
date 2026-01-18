import { useAuthStore } from '@/features/auth/store/authStore';
import { env } from '@/config/env';
import { stompClient } from './stompClient';
import type { 
    WebSocketMessage, 
    TypingEvent, 
    MessageEvent, 
    StompSubscription
} from './types';

class WebSocketService {
    private activeSubscriptions: Map<string, StompSubscription> = new Map();

    async connect(): Promise<void> {
        const { accessToken } = useAuthStore.getState();
        
        if (!accessToken) {
            throw new Error('No access token available for WebSocket connection');
        }

        const wsUrl = env.API_URL.replace('/api', '') + '/ws';

        await stompClient.connect({
            url: wsUrl,
            accessToken,
            onConnect: () => {
                console.log('[WebSocket] Connected successfully');
            },
            onDisconnect: () => {
                console.log('[WebSocket] Disconnected');
                this.activeSubscriptions.clear();
            },
            onError: (error) => {
                console.error('[WebSocket] Error:', error);
            },
        });
    }

    disconnect(): void {
        stompClient.disconnect();
        this.activeSubscriptions.clear();
    }

    subscribeToConversation(
        conversationId: string,
        onMessage: (message: WebSocketMessage<MessageEvent>) => void
    ): StompSubscription | null {
        const destination = `/topic/conversation.${conversationId}`;
        const subscription = stompClient.subscribe<MessageEvent>(destination, onMessage);
        
        if (subscription) {
            this.activeSubscriptions.set(`conversation-${conversationId}`, subscription);
        }
        
        return subscription;
    }

    subscribeToChannel(
        conversationId: string,
        onMessage: (message: WebSocketMessage<MessageEvent>) => void
    ): StompSubscription | null {
        const destination = `/topic/channel.${conversationId}`;
        const subscription = stompClient.subscribe<MessageEvent>(destination, onMessage);
        
        if (subscription) {
            this.activeSubscriptions.set(`channel-${conversationId}`, subscription);
        }
        
        return subscription;
    }

    subscribeToUserQueue(
        onMessage: (message: WebSocketMessage<any>) => void
    ): StompSubscription | null {
        const destination = '/user/queue/message';
        const subscription = stompClient.subscribe(destination, onMessage);
        
        if (subscription) {
            this.activeSubscriptions.set('user-queue', subscription);
        }
        
        return subscription;
    }

    subscribeToTyping(
        conversationId: string,
        onTyping: (event: TypingEvent) => void
    ): StompSubscription | null {
        const destination = '/user/queue/typing';
        const subscription = stompClient.subscribe<TypingEvent>(destination, (message) => {
            if (message.data.conversationId === conversationId) {
                onTyping(message.data);
            }
        });
        
        if (subscription) {
            this.activeSubscriptions.set(`typing-${conversationId}`, subscription);
        }
        
        return subscription;
    }

    sendTypingEvent(conversationId: string, isTyping: boolean): void {
        const { user } = useAuthStore.getState();
        
        if (!user) return;

        const typingEvent: TypingEvent = {
            userId: Number(user.id),
            userName: user.displayName,
            conversationId,
            isTyping,
        };

        stompClient.send(`/app/typing/${conversationId}`, typingEvent);
    }

    unsubscribeFromConversation(conversationId: string): void {
        const key = `conversation-${conversationId}`;
        const subscription = this.activeSubscriptions.get(key);
        if (subscription) {
            subscription.unsubscribe();
            this.activeSubscriptions.delete(key);
        }
    }

    unsubscribeAll(): void {
        this.activeSubscriptions.forEach((sub) => sub.unsubscribe());
        this.activeSubscriptions.clear();
    }

    isConnected(): boolean {
        return stompClient.isConnected();
    }
}

export const websocketService = new WebSocketService();
