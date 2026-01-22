/**
 * useRealtime.ts
 * Real-time hooks using Firebase RTDB
 * 
 * NOTE: WebSocket functionality has been migrated to Firebase RTDB.
 * These exports provide backward-compatible APIs.
 */

import { useFirebaseChat } from '@/providers/FirebaseChatProvider';

/**
 * Hook for connection status - now uses Firebase RTDB
 * @deprecated Use useFirebaseChat() directly for Firebase connection state
 */
export function useWebSocketConnection() {
    const { isConnected, isConnecting, reconnect } = useFirebaseChat();

    return {
        isConnected,
        isConnecting,
        error: null,
        connect: reconnect,
        disconnect: () => { /* Firebase handles connection lifecycle */ },
    };
}

/**
 * Hook for real-time conversation messages
 * @deprecated Messages are now handled via useChatSubscription with RTDB
 */
export function useConversationMessages() {
    return { realtimeMessages: [] };
}

/**
 * @deprecated Use useTypingIndicator from ./useTypingIndicator.ts instead
 * That hook uses Firebase RTDB via rtdbTypingService
 */
export { useTypingIndicator } from './useTypingIndicator';

/**
 * @deprecated Real-time updates are now handled via Firebase RTDB subscriptions
 */
export function useRealtimeUpdates() {
    return;
}
