import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useWebSocketConnection } from '@/features/chat/hooks/useRealtime';

interface WebSocketContextValue {
    isConnected: boolean;
    isConnecting: boolean;
    error: Error | null;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { isConnected, isConnecting, error, connect, disconnect } = useWebSocketConnection();

    useEffect(() => {
        if (isAuthenticated && !isConnected && !isConnecting) {
            connect().catch((err) => {
                console.error('[WebSocket Provider] Failed to connect:', err);
            });
        }

        if (!isAuthenticated && isConnected) {
            disconnect();
        }
    }, [isAuthenticated, isConnected, isConnecting, connect, disconnect]);

    const value: WebSocketContextValue = {
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
    };

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket(): WebSocketContextValue {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
}
