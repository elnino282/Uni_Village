/**
 * useTypingIndicator hook
 * Debounced typing event sender with auto-timeout using Firebase RTDB
 */
import { useCallback, useEffect, useRef, useState } from "react";

import {
    rtdbTypingService,
    type TypingUser,
} from "../services/rtdbTyping.service";

const TYPING_DEBOUNCE_MS = 300;
const TYPING_TIMEOUT_MS = 3000;

/**
 * Hook for managing typing indicator with debounce and auto-cleanup
 * Uses Firebase RTDB for real-time typing updates
 * @param conversationId - Current conversation ID
 */
export function useTypingIndicator(conversationId: string | undefined) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Refs for debounce and timeout
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingSentRef = useRef(false);

  /**
   * Send typing event with debounce
   */
  const sendTyping = useCallback(() => {
    if (!conversationId) return;

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the typing event
    debounceTimerRef.current = setTimeout(async () => {
      // Only send if we haven't already sent "typing = true"
      if (!isTypingSentRef.current) {
        try {
          await rtdbTypingService.setTyping(conversationId, true);
          isTypingSentRef.current = true;
        } catch (error) {
          console.error("[useTypingIndicator] Error setting typing:", error);
        }
      }

      // Reset or start the auto-stop timer
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }

      autoStopTimerRef.current = setTimeout(async () => {
        if (isTypingSentRef.current) {
          try {
            await rtdbTypingService.setTyping(conversationId, false);
          } catch (error) {
            console.error("[useTypingIndicator] Error clearing typing:", error);
          }
          isTypingSentRef.current = false;
        }
      }, TYPING_TIMEOUT_MS);
    }, TYPING_DEBOUNCE_MS);
  }, [conversationId]);

  /**
   * Stop typing immediately (call when user sends message or leaves input)
   */
  const stopTyping = useCallback(async () => {
    if (!conversationId) return;

    // Clear all timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }

    // Send stop typing if we had sent start
    if (isTypingSentRef.current) {
      try {
        await rtdbTypingService.setTyping(conversationId, false);
      } catch (error) {
        console.error("[useTypingIndicator] Error stopping typing:", error);
      }
      isTypingSentRef.current = false;
    }
  }, [conversationId]);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!conversationId) {
      setTypingUsers([]);
      return;
    }

    let isActive = true;

    const unsubscribe = rtdbTypingService.subscribeToTyping(
      conversationId,
      (users) => {
        if (isActive && isMountedRef.current) {
          setTypingUsers(users);
        }
      },
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      isActive = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [conversationId]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }
      if (isTypingSentRef.current && conversationId) {
        rtdbTypingService.setTyping(conversationId, false).catch(() => {});
        isTypingSentRef.current = false;
      }
    };
  }, [conversationId]);

  // Convert to legacy format for UI compatibility
  const typingUsersList = typingUsers.map((user) => ({
    userId: 0, // Legacy ID not available from RTDB
    userName: user.displayName,
    timestamp: user.timestamp,
  }));

  return {
    /** Call this on text input change */
    sendTyping,
    /** Call this when user sends a message or blurs input */
    stopTyping,
    /** Legacy API: sendTypingEvent(isTyping) - for backward compatibility */
    sendTypingEvent: (isTyping: boolean) => {
      if (isTyping) {
        sendTyping();
      } else {
        stopTyping();
      }
    },
    /** List of currently typing users */
    typingUsers: typingUsersList,
    /** True if anyone is typing */
    isAnyoneTyping: typingUsersList.length > 0,
    /** Formatted typing indicator text */
    typingText: getTypingText(typingUsersList),
  };
}

/**
 * Format typing indicator text
 */
function getTypingText(
  typingUsers: Array<{ userId: number; userName: string }>,
): string {
  if (typingUsers.length === 0) return "";
  if (typingUsers.length === 1)
    return `${typingUsers[0].userName} đang nhập...`;
  if (typingUsers.length === 2) {
    return `${typingUsers[0].userName} và ${typingUsers[1].userName} đang nhập...`;
  }
  return `${typingUsers[0].userName} và ${typingUsers.length - 1} người khác đang nhập...`;
}
