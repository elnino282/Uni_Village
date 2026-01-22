/**
 * Session Events
 * Event emitter for session-related events (token expiration, invalidation)
 */

type SessionEventListener = () => void;

class SessionEventEmitter {
  private listeners: Set<SessionEventListener> = new Set();

  /**
   * Subscribe to session expired events
   */
  subscribe(listener: SessionEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit session expired event
   * Called when token refresh fails or token is invalidated
   */
  emitSessionExpired(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("[SessionEvents] Error in listener:", error);
      }
    });
  }
}

export const sessionEvents = new SessionEventEmitter();
