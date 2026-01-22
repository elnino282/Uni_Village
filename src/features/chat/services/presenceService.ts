/**
 * Presence Service
 * 
 * @deprecated This file is deprecated. Use rtdbPresence.service.ts instead.
 * 
 * This file re-exports from the RTDB presence service for backward compatibility.
 * All new code should import directly from rtdbPresence.service.ts
 */

import { rtdbPresenceService } from './rtdbPresence.service';

/**
 * Legacy PresenceService class wrapper
 * Provides backward-compatible API over Firebase RTDB presence
 * @deprecated Use rtdbPresenceService directly
 */
class PresenceService {
    private onlineUsersLegacy: Set<number> = new Set();
    private presenceCallbacksLegacy: Map<number, Set<(isOnline: boolean) => void>> = new Map();

    /**
     * Subscribe to user presence by legacy userId
     * @deprecated Use rtdbPresenceService.subscribeToUserPresence(uid, callback) instead
     */
    subscribeToUserPresence(userId: number, callback: (isOnline: boolean) => void): () => void {
        // Map legacy userId to string UID
        const uid = userId.toString();
        return rtdbPresenceService.subscribeToUserPresence(uid, callback);
    }

    /**
     * @deprecated Presence is now handled automatically by Firebase RTDB
     */
    setUserOnline(userId: number): void {
        this.onlineUsersLegacy.add(userId);
    }

    /**
     * @deprecated Presence is now handled automatically by Firebase RTDB
     */
    setUserOffline(userId: number): void {
        this.onlineUsersLegacy.delete(userId);
    }

    /**
     * Check if user is online
     * @deprecated Use rtdbPresenceService.isUserOnline(uid) instead
     */
    isUserOnline(userId: number): boolean {
        return rtdbPresenceService.isUserOnline(userId.toString());
    }

    /**
     * @deprecated Firebase RTDB handles heartbeat automatically via .info/connected
     */
    startHeartbeat(): void {
        console.log('[PresenceService] Heartbeat handled by Firebase RTDB');
    }

    /**
     * @deprecated Firebase RTDB handles heartbeat automatically
     */
    stopHeartbeat(): void {
        // No-op
    }

    /**
     * @deprecated Use rtdbPresenceService for presence events
     */
    subscribeToPresenceEvents(): void {
        console.log('[PresenceService] Presence events handled by Firebase RTDB');
    }

    /**
     * @deprecated Use rtdbPresenceService for presence events
     */
    unsubscribeFromPresenceEvents(): void {
        // No-op
    }

    /**
     * Initialize presence
     * @deprecated Use rtdbPresenceService.initialize() instead
     */
    initialize(): void {
        rtdbPresenceService.initialize();
    }

    /**
     * Cleanup presence
     * @deprecated Use rtdbPresenceService.cleanup() instead
     */
    cleanup(): void {
        rtdbPresenceService.cleanup();
    }

    /**
     * Clear all state
     * @deprecated Use rtdbPresenceService.cleanup() instead
     */
    clear(): void {
        rtdbPresenceService.cleanup();
        this.presenceCallbacksLegacy.clear();
        this.onlineUsersLegacy.clear();
    }
}

export const presenceService = new PresenceService();

// Re-export RTDB service for direct usage
export { rtdbPresenceService };
