/**
 * useOnlineStatus hook
 * Subscribes to user presence using Firebase RTDB
 */
import { useFirebaseChat } from "@/providers/FirebaseChatProvider";
import { useEffect, useState } from "react";
import { rtdbPresenceService } from "../services/rtdbPresence.service";

/**
 * Hook to get online status for a single user
 * @param userId - Legacy user ID (will need mapping to Firebase UID)
 */
export function useOnlineStatus(userId: number | undefined) {
  const [isOnline, setIsOnline] = useState(false);
  const { isConnected } = useFirebaseChat();

  useEffect(() => {
    if (!userId) {
      setIsOnline(false);
      return;
    }

    if (!isConnected) {
      setIsOnline(false);
      return;
    }

    // Note: For legacy userId, we need a mapping to Firebase UID
    // For now, convert to string as a placeholder
    // TODO: Implement proper userId -> Firebase UID mapping
    const uid = userId.toString();

    const unsubscribe = rtdbPresenceService.subscribeToUserPresence(
      uid,
      (online) => {
        setIsOnline(online);
      },
    );

    return unsubscribe;
  }, [userId, isConnected]);

  return { isOnline };
}

/**
 * Hook to get online status for multiple users
 * @param userIds - Array of legacy user IDs
 */
export function useUserPresence(userIds: number[]) {
  const [onlineStatus, setOnlineStatus] = useState<Map<number, boolean>>(
    new Map(),
  );
  const { isConnected } = useFirebaseChat();

  useEffect(() => {
    if (!isConnected || userIds.length === 0) {
      setOnlineStatus(new Map());
      return;
    }

    const unsubscribers = userIds.map((userId) => {
      // Note: For legacy userId, we need a mapping to Firebase UID
      const uid = userId.toString();

      return rtdbPresenceService.subscribeToUserPresence(uid, (isOnline) => {
        setOnlineStatus((prev) => {
          const next = new Map(prev);
          next.set(userId, isOnline);
          return next;
        });
      });
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [userIds.join(","), isConnected]);

  return { onlineStatus };
}

/**
 * Hook to get online status using Firebase UID directly
 * @param uid - Firebase UID
 */
export function useOnlineStatusByUid(uid: string | undefined) {
  const [isOnline, setIsOnline] = useState(false);
  const { isConnected } = useFirebaseChat();

  useEffect(() => {
    if (!uid || !isConnected) {
      setIsOnline(false);
      return;
    }

    const unsubscribe = rtdbPresenceService.subscribeToUserPresence(
      uid,
      (online) => {
        setIsOnline(online);
      },
    );

    return unsubscribe;
  }, [uid, isConnected]);

  return { isOnline };
}
