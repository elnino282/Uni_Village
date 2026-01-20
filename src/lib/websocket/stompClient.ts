import { Client, IMessage, StompConfig } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { WebSocketConfig, WebSocketMessage, StompSubscription } from './types';

class StompClientService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private isConnecting = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;

    connect(config: WebSocketConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.client?.connected) {
                resolve();
                return;
            }

            if (this.isConnecting) {
                reject(new Error('Connection already in progress'));
                return;
            }

            this.isConnecting = true;

            const stompConfig: StompConfig = {
                connectHeaders: {
                    Authorization: `Bearer ${config.accessToken}`,
                },
                brokerURL: undefined,
                webSocketFactory: () => new SockJS(config.url) as any,
                debug: (str) => {
                    if (__DEV__) {
                        console.log('[STOMP Debug]', str);
                    }
                },
                reconnectDelay: this.reconnectDelay,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: () => {
                    console.log('[STOMP] Connected');
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    config.onConnect?.();
                    resolve();
                },
                onDisconnect: () => {
                    console.log('[STOMP] Disconnected');
                    this.isConnecting = false;
                    config.onDisconnect?.();
                },
                onStompError: (frame) => {
                    console.error('[STOMP] Error:', frame.headers['message'], frame.body);
                    this.isConnecting = false;
                    const error = new Error(frame.headers['message'] || 'STOMP error');
                    config.onError?.(error);
                    reject(error);
                },
                onWebSocketError: (event) => {
                    console.error('[STOMP] WebSocket error:', event);
                    this.isConnecting = false;
                    const error = new Error('WebSocket connection failed');
                    config.onError?.(error);
                    reject(error);
                },
            };

            this.client = new Client(stompConfig);
            this.client.activate();
        });
    }

    disconnect(): void {
        if (this.client) {
            this.subscriptions.forEach((sub) => sub.unsubscribe());
            this.subscriptions.clear();
            this.client.deactivate();
            this.client = null;
        }
    }

    subscribe<T = unknown>(
        destination: string,
        callback: (message: WebSocketMessage<T>) => void
    ): StompSubscription | null {
        if (!this.client?.connected) {
            console.warn('[STOMP] Cannot subscribe - not connected');
            return null;
        }

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            try {
                const parsedMessage = JSON.parse(message.body) as WebSocketMessage<T>;
                callback(parsedMessage);
            } catch (error) {
                console.error('[STOMP] Failed to parse message:', error);
            }
        });

        const stompSub: StompSubscription = {
            id: subscription.id,
            topic: destination,
            unsubscribe: () => {
                subscription.unsubscribe();
                this.subscriptions.delete(subscription.id);
            },
        };

        this.subscriptions.set(subscription.id, stompSub);
        return stompSub;
    }

    send(destination: string, body: any): void {
        if (!this.client?.connected) {
            console.warn('[STOMP] Cannot send - not connected');
            return;
        }

        this.client.publish({
            destination,
            body: JSON.stringify(body),
        });
    }

    isConnected(): boolean {
        return this.client?.connected || false;
    }

    unsubscribe(subscriptionId: string): void {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            subscription.unsubscribe();
        }
    }

    unsubscribeAll(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();
    }
}

export const stompClient = new StompClientService();
