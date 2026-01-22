/**
 * useSendMessageViaWebSocket hook
 * Deprecated: WebSocket chat sending removed in RTDB migration.
 */
import { useCallback } from 'react';

export function useSendMessageViaWebSocket() {
    const sendMessage = useCallback(async () => {
        throw new Error('WebSocket chat sending is no longer supported');
    }, []);

    return {
        sendMessage,
        isConnected: () => false,
        generateClientMessageId: () => `rtdb_${Date.now()}`,
    };
}
