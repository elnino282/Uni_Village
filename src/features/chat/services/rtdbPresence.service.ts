/**
 * Presence Service
 * Manages user online/offline status using Firebase Realtime Database
 *
 * Uses .info/connected + onDisconnect() for reliable presence tracking
 */

import {
    onDisconnect,
    onValue,
    ref,
    set,
    type Unsubscribe
} from "firebase/database";

import { auth, database } from "@/lib/firebase";
import type { RtdbUserStatus } from "./firebaseRtdb.service";

type PresenceCallback = (isOnline: boolean) => void;

class RtdbPresenceService {
  private presenceUnsubscribe: Unsubscribe | null = null;
  private presenceCallbacks: Map<string, Set<PresenceCallback>> = new Map();
  private userStatusUnsubscribes: Map<string, Unsubscribe> = new Map();
  private onlineUsers: Set<string> = new Set();
  private isInitialized = false;

  /**
   * Initialize presence for the current authenticated user
   * Sets up online status and onDisconnect handler
   */
  initialize(): void {
    const user = auth.currentUser;
    if (!user) {
      console.warn(
        "[PresenceService] Cannot initialize: no authenticated user",
      );
      return;
    }

    if (this.isInitialized) {
      console.log("[PresenceService] Already initialized");
      return;
    }

    const uid = user.uid;
    const statusRef = ref(database, `status/${uid}`);
    const connectedRef = ref(database, ".info/connected");

    this.presenceUnsubscribe = onValue(connectedRef, async (snapshot) => {
      if (snapshot.val() === true) {
        console.log("[PresenceService] Connected to Firebase RTDB");

        // Set online status
        await set(statusRef, {
          state: "online",
          lastChanged: Date.now(),
        });

        // Configure onDisconnect to set offline when connection is lost
        await onDisconnect(statusRef).set({
          state: "offline",
          lastChanged: Date.now(),
        });

        this.isInitialized = true;
      } else {
        console.log("[PresenceService] Disconnected from Firebase RTDB");
      }
    });

    console.log("[PresenceService] Presence initialized for user:", uid);
  }

  /**
   * Cleanup presence - call when user logs out
   */
  async cleanup(): Promise<void> {
    if (this.presenceUnsubscribe) {
      this.presenceUnsubscribe();
      this.presenceUnsubscribe = null;
    }

    // Set offline status before cleanup
    const user = auth.currentUser;
    if (user) {
      try {
        const statusRef = ref(database, `status/${user.uid}`);
        await set(statusRef, {
          state: "offline",
          lastChanged: Date.now(),
        });
      } catch (error) {
        console.error("[PresenceService] Error setting offline status:", error);
      }
    }

    // Clear all user status subscriptions
    this.userStatusUnsubscribes.forEach((unsub) => unsub());
    this.userStatusUnsubscribes.clear();
    this.presenceCallbacks.clear();
    this.onlineUsers.clear();
    this.isInitialized = false;

    console.log("[PresenceService] Cleaned up");
  }

  /**
   * Subscribe to a user's online status
   * @param uid - Firebase UID of the user to watch
   * @param callback - Called with true/false when status changes
   * @returns Unsubscribe function
   */
  subscribeToUserPresence(uid: string, callback: PresenceCallback): () => void {
    // Add callback to the set for this user
    if (!this.presenceCallbacks.has(uid)) {
      this.presenceCallbacks.set(uid, new Set());
      this.startWatchingUser(uid);
    }

    this.presenceCallbacks.get(uid)!.add(callback);

    // Immediately call with current known status
    callback(this.onlineUsers.has(uid));

    // Return unsubscribe function
    return () => {
      const callbacks = this.presenceCallbacks.get(uid);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.stopWatchingUser(uid);
          this.presenceCallbacks.delete(uid);
        }
      }
    };
  }

  /**
   * Check if a user is currently online
   */
  isUserOnline(uid: string): boolean {
    return this.onlineUsers.has(uid);
  }

  /**
   * Get all online users from the tracked set
   */
  getOnlineUsers(): Set<string> {
    return new Set(this.onlineUsers);
  }

  /**
   * Manually set current user's status (e.g., when app goes to background)
   */
  async setStatus(state: "online" | "offline"): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      console.warn(
        "[PresenceService] Cannot set status: no authenticated user",
      );
      return;
    }

    const statusRef = ref(database, `status/${user.uid}`);
    await set(statusRef, {
      state,
      lastChanged: Date.now(),
    });

    console.log("[PresenceService] Status set to:", state);
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private startWatchingUser(uid: string): void {
    if (this.userStatusUnsubscribes.has(uid)) {
      return; // Already watching
    }

    const statusRef = ref(database, `status/${uid}`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.val() as RtdbUserStatus | null;
      const isOnline = status?.state === "online";

      const wasOnline = this.onlineUsers.has(uid);
      if (isOnline) {
        this.onlineUsers.add(uid);
      } else {
        this.onlineUsers.delete(uid);
      }

      // Notify all callbacks if status changed
      if (wasOnline !== isOnline) {
        this.notifyPresenceChange(uid, isOnline);
      }
    });

    this.userStatusUnsubscribes.set(uid, unsubscribe);
  }

  private stopWatchingUser(uid: string): void {
    const unsubscribe = this.userStatusUnsubscribes.get(uid);
    if (unsubscribe) {
      unsubscribe();
      this.userStatusUnsubscribes.delete(uid);
      this.onlineUsers.delete(uid);
    }
  }

  private notifyPresenceChange(uid: string, isOnline: boolean): void {
    const callbacks = this.presenceCallbacks.get(uid);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(isOnline);
        } catch (error) {
          console.error("[PresenceService] Error in presence callback:", error);
        }
      });
    }
  }
}

// Export singleton instance
export const rtdbPresenceService = new RtdbPresenceService();

// Also export class for testing
export { RtdbPresenceService };

