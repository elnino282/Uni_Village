import type { WebSocketMessage } from '@/lib/websocket';
import { websocketService } from '@/lib/websocket';

interface PresenceEvent {
    userId: number;
    isOnline: boolean;
    lastSeen?: string;
}

class PresenceService {
    private onlineUsers: Set<number> = new Set();
    private presenceCallbacks: Map<number, Set<(isOnline: boolean) => void>> = new Map();

    subscribeToUserPresence(userId: number, callback: (isOnline: boolean) => void): () => void {
        if (!this.presenceCallbacks.has(userId)) {
            this.presenceCallbacks.set(userId, new Set());
        }
        
        this.presenceCallbacks.get(userId)!.add(callback);

        callback(this.onlineUsers.has(userId));

        return () => {
            const callbacks = this.presenceCallbacks.get(userId);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.presenceCallbacks.delete(userId);
                }
            }
        };
    }

    setUserOnline(userId: number): void {
        const wasOffline = !this.onlineUsers.has(userId);
        this.onlineUsers.add(userId);
        
        if (wasOffline) {
            this.notifyPresenceChange(userId, true);
        }
    }

    setUserOffline(userId: number): void {
        const wasOnline = this.onlineUsers.has(userId);
        this.onlineUsers.delete(userId);
        
        if (wasOnline) {
            this.notifyPresenceChange(userId, false);
        }
    }

    isUserOnline(userId: number): boolean {
        return this.onlineUsers.has(userId);
    }

    private notifyPresenceChange(userId: number, isOnline: boolean): void {
        const callbacks = this.presenceCallbacks.get(userId);
        if (callbacks) {
            callbacks.forEach((callback) => callback(isOnline));
        }
    }

    trackWebSocketUsers(): void {
        if (!websocketService.isConnected()) {
            this.onlineUsers.clear();
            this.presenceCallbacks.forEach((callbacks, userId) => {
                callbacks.forEach((callback) => callback(false));
            });
            return;
        }

        websocketService.subscribeToUserQueue((message: WebSocketMessage<any>) => {
            if (message.eventType === 'USER_ONLINE') {
                this.setUserOnline(message.data.userId);
            } else if (message.eventType === 'USER_OFFLINE') {
                this.setUserOffline(message.data.userId);
            }
        });
    }

    clear(): void {
        this.onlineUsers.clear();
        this.presenceCallbacks.clear();
    }
}

export const presenceService = new PresenceService();
