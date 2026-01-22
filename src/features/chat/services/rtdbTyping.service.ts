/**
 * Typing Indicator Service
 * Manages typing indicators using Firebase Realtime Database
 *
 * Path: typing/{conversationId}/{uid}
 */

import { onValue, ref, remove, set, type Unsubscribe } from "firebase/database";

import { auth, database } from "@/lib/firebase";

export interface TypingUser {
  uid: string;
  displayName: string;
  timestamp: number;
}

type TypingCallback = (typingUsers: TypingUser[]) => void;

const TYPING_TIMEOUT_MS = 10000; // 10 seconds

class RtdbTypingService {
  private typingSubscriptions: Map<string, Unsubscribe> = new Map();
  private typingCallbacks: Map<string, Set<TypingCallback>> = new Map();
  private typingState: Map<string, TypingUser[]> = new Map();
  private currentTypingTimers: Map<string, ReturnType<typeof setTimeout>> =
    new Map();

  /**
   * Set typing status for current user in a conversation
   * @param conversationId - The conversation ID
   * @param isTyping - Whether the user is typing
   */
  async setTyping(conversationId: string, isTyping: boolean): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      console.warn("[TypingService] Cannot set typing: no authenticated user");
      return;
    }

    const uid = user.uid;
    const typingRef = ref(database, `typing/${conversationId}/${uid}`);

    // Clear any existing auto-clear timer
    const timerKey = `${conversationId}_${uid}`;
    const existingTimer = this.currentTypingTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.currentTypingTimers.delete(timerKey);
    }

    if (isTyping) {
      await set(typingRef, {
        displayName: user.displayName ?? "Unknown",
        isTyping: true,
        timestamp: Date.now(),
      });

      // Auto-clear after timeout
      const timer = setTimeout(async () => {
        try {
          await remove(typingRef);
        } catch (error) {
          console.error("[TypingService] Error auto-clearing typing:", error);
        }
        this.currentTypingTimers.delete(timerKey);
      }, TYPING_TIMEOUT_MS);

      this.currentTypingTimers.set(timerKey, timer);
    } else {
      await remove(typingRef);
    }
  }

  /**
   * Subscribe to typing indicators in a conversation
   * @param conversationId - The conversation ID
   * @param callback - Called when typing users change
   * @returns Unsubscribe function
   */
  subscribeToTyping(
    conversationId: string,
    callback: TypingCallback,
  ): () => void {
    // Add callback
    if (!this.typingCallbacks.has(conversationId)) {
      this.typingCallbacks.set(conversationId, new Set());
      this.startWatchingTyping(conversationId);
    }

    this.typingCallbacks.get(conversationId)!.add(callback);

    // Immediately call with current state
    const currentState = this.typingState.get(conversationId) ?? [];
    callback(currentState);

    // Return unsubscribe function
    return () => {
      const callbacks = this.typingCallbacks.get(conversationId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.stopWatchingTyping(conversationId);
          this.typingCallbacks.delete(conversationId);
          this.typingState.delete(conversationId);
        }
      }
    };
  }

  /**
   * Get current typing users for a conversation
   */
  getTypingUsers(conversationId: string): TypingUser[] {
    return this.typingState.get(conversationId) ?? [];
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    // Clear all subscriptions
    this.typingSubscriptions.forEach((unsub) => unsub());
    this.typingSubscriptions.clear();
    this.typingCallbacks.clear();
    this.typingState.clear();

    // Clear all timers
    this.currentTypingTimers.forEach((timer) => clearTimeout(timer));
    this.currentTypingTimers.clear();

    console.log("[TypingService] Cleaned up");
  }

  /**
   * Clear typing status when leaving a conversation
   */
  async clearTypingOnLeave(conversationId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    const typingRef = ref(database, `typing/${conversationId}/${user.uid}`);

    // Clear timer
    const timerKey = `${conversationId}_${user.uid}`;
    const timer = this.currentTypingTimers.get(timerKey);
    if (timer) {
      clearTimeout(timer);
      this.currentTypingTimers.delete(timerKey);
    }

    try {
      await remove(typingRef);
    } catch (error) {
      console.error("[TypingService] Error clearing typing on leave:", error);
    }
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private startWatchingTyping(conversationId: string): void {
    if (this.typingSubscriptions.has(conversationId)) {
      return; // Already watching
    }

    const typingRef = ref(database, `typing/${conversationId}`);
    const currentUid = auth.currentUser?.uid;

    const unsubscribe = onValue(typingRef, (snapshot) => {
      const typingUsers: TypingUser[] = [];
      const now = Date.now();

      snapshot.forEach((childSnapshot) => {
        const uid = childSnapshot.key!;
        const data = childSnapshot.val();

        // Skip current user and stale entries
        if (
          uid !== currentUid &&
          data &&
          data.isTyping &&
          now - data.timestamp < TYPING_TIMEOUT_MS
        ) {
          typingUsers.push({
            uid,
            displayName: data.displayName ?? "Unknown",
            timestamp: data.timestamp,
          });
        }
      });

      // Update state and notify
      this.typingState.set(conversationId, typingUsers);
      this.notifyTypingChange(conversationId, typingUsers);
    });

    this.typingSubscriptions.set(conversationId, unsubscribe);
  }

  private stopWatchingTyping(conversationId: string): void {
    const unsubscribe = this.typingSubscriptions.get(conversationId);
    if (unsubscribe) {
      unsubscribe();
      this.typingSubscriptions.delete(conversationId);
    }
  }

  private notifyTypingChange(
    conversationId: string,
    typingUsers: TypingUser[],
  ): void {
    const callbacks = this.typingCallbacks.get(conversationId);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(typingUsers);
        } catch (error) {
          console.error("[TypingService] Error in typing callback:", error);
        }
      });
    }
  }
}

// Export singleton instance
export const rtdbTypingService = new RtdbTypingService();

// Also export class for testing
export { RtdbTypingService };

