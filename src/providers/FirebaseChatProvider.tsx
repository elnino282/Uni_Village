/**
 * Firebase Chat Provider
 * Manages Firebase RTDB connection lifecycle for chat features
 * Replaces WebSocketProvider for chat-related real-time communication
 */

import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

import { queryKeys } from "@/config/queryKeys";
import { rtdbPresenceService } from "@/features/chat/services/rtdbPresence.service";
import { rtdbTypingService } from "@/features/chat/services/rtdbTyping.service";
import { useChatStore } from "@/features/chat/store/chatStore";
import { auth, database } from "@/lib/firebase";
import { useQueryClient } from "@tanstack/react-query";
import { onValue, ref } from "firebase/database";

interface FirebaseChatContextValue {
  /** Whether connected to Firebase RTDB */
  isConnected: boolean;
  /** Whether connection is being established */
  isConnecting: boolean;
  /** Connection error if any */
  error: Error | null;
  /** Firebase Auth user */
  firebaseUser: FirebaseUser | null;
  /** Manually reconnect (triggers presence re-initialization) */
  reconnect: () => void;
}

const FirebaseChatContext = createContext<FirebaseChatContextValue | undefined>(
  undefined,
);

interface FirebaseChatProviderProps {
  children: React.ReactNode;
}

export function FirebaseChatProvider({ children }: FirebaseChatProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const queryClient = useQueryClient();
  const setSocketStatus = useChatStore((state) => state.setSocketStatus);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const wasConnectedRef = useRef(false);
  const connectionUnsubscribeRef = useRef<(() => void) | null>(null);
  const reconnectRef = useRef<(() => void) | null>(null);

  /**
   * Initialize Firebase RTDB connection monitoring
   */
  const initializeConnection = useCallback(() => {
    const connectedRef = ref(database, ".info/connected");

    const unsubscribe = onValue(
      connectedRef,
      (snapshot) => {
        const connected = snapshot.val() === true;

        console.log(
          "[FirebaseChatProvider] Connection state:",
          connected ? "connected" : "disconnected",
        );

        setError(null);
        setIsConnected(connected);
        setIsConnecting(false);

        if (connected && !wasConnectedRef.current) {
          console.log("[FirebaseChatProvider] Connected to Firebase RTDB");
          wasConnectedRef.current = true;

          if (firebaseUser) {
            rtdbPresenceService.initialize();

            setTimeout(() => {
              queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
              });
            }, 500);
          }
        } else if (!connected && wasConnectedRef.current) {
          console.log("[FirebaseChatProvider] Disconnected from Firebase RTDB");
          wasConnectedRef.current = false;
        }
      },
      (err) => {
        console.error("[FirebaseChatProvider] Connection error:", err);
        setError(err as Error);
        setIsConnecting(false);
        setIsConnected(false);
        wasConnectedRef.current = false;
      },
    );

    connectionUnsubscribeRef.current = unsubscribe;

    return unsubscribe;
  }, [firebaseUser, queryClient]);

  /**
   * Initialize presence when authenticated
   */
  const initializePresence = useCallback(() => {
    if (firebaseUser && isConnected) {
      console.log(
        "[FirebaseChatProvider] Initializing presence for user:",
        firebaseUser.uid,
      );
      rtdbPresenceService.initialize();
    }
  }, [firebaseUser, isConnected]);

  /**
   * Reconnect manually with retry logic
   */
  const reconnect = useCallback(() => {
    console.log("[FirebaseChatProvider] Manual reconnect triggered");

    if (connectionUnsubscribeRef.current) {
      connectionUnsubscribeRef.current();
      connectionUnsubscribeRef.current = null;
    }

    setIsConnecting(true);
    setError(null);
    wasConnectedRef.current = false;

    const attemptReconnect = () => {
      try {
        initializeConnection();

        if (firebaseUser) {
          setTimeout(() => {
            rtdbPresenceService.initialize();
          }, 500);
        }
      } catch (err) {
        console.error("[FirebaseChatProvider] Reconnect error:", err);
        setError(err as Error);
        setIsConnecting(false);

        setTimeout(() => {
          if (!isConnected) {
            attemptReconnect();
          }
        }, 2000);
      }
    };

    attemptReconnect();
  }, [initializeConnection, firebaseUser, isConnected]);

  useEffect(() => {
    reconnectRef.current = reconnect;
  }, [reconnect]);

  /**
   * Handle app state changes (background/foreground)
   */
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (
        previousState.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("[FirebaseChatProvider] App came to foreground");

        if (firebaseUser) {
          rtdbPresenceService.setStatus("online").catch((err) => {
            console.error(
              "[FirebaseChatProvider] Error setting online status:",
              err,
            );
          });

          if (wasConnectedRef.current || isConnected) {
            console.log(
              "[FirebaseChatProvider] Syncing conversations after foreground",
            );
            setTimeout(() => {
              queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
              });
            }, 500);
          } else {
            reconnectRef.current?.();
          }
        }
      } else if (
        nextAppState.match(/inactive|background/) &&
        previousState === "active"
      ) {
        console.log("[FirebaseChatProvider] App going to background");

        if (firebaseUser) {
          rtdbPresenceService.setStatus("offline").catch((err) => {
            console.error(
              "[FirebaseChatProvider] Error setting offline status:",
              err,
            );
          });
        }
      }
    },
    [firebaseUser, queryClient, isConnected],
  );

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        "[FirebaseChatProvider] Auth state changed:",
        user?.uid ?? "signed out",
      );
      setFirebaseUser(user);

      if (!user) {
        // User signed out - cleanup
        rtdbPresenceService.cleanup();
        rtdbTypingService.cleanup();
        wasConnectedRef.current = false;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Initialize connection monitoring
  useEffect(() => {
    const unsubscribe = initializeConnection();

    return () => {
      unsubscribe();
      connectionUnsubscribeRef.current = null;
    };
  }, [initializeConnection]);

  // Keep chat store socket status in sync with Firebase RTDB connection
  useEffect(() => {
    if (!firebaseUser) {
      setSocketStatus("disconnected");
      return;
    }

    if (error) {
      setSocketStatus("error", error.message);
      return;
    }

    if (isConnecting) {
      setSocketStatus("connecting");
      return;
    }

    setSocketStatus(isConnected ? "connected" : "disconnected");
  }, [firebaseUser, error, isConnecting, isConnected, setSocketStatus]);

  // Initialize presence when authenticated and connected
  useEffect(() => {
    initializePresence();
  }, [initializePresence]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      rtdbPresenceService.cleanup();
      rtdbTypingService.cleanup();
    };
  }, []);

  const value: FirebaseChatContextValue = {
    isConnected,
    isConnecting,
    error,
    firebaseUser,
    reconnect,
  };

  return (
    <FirebaseChatContext.Provider value={value}>
      {children}
    </FirebaseChatContext.Provider>
  );
}

/**
 * Hook to access Firebase Chat context
 */
export function useFirebaseChat(): FirebaseChatContextValue {
  const context = useContext(FirebaseChatContext);

  if (!context) {
    throw new Error("useFirebaseChat must be used within FirebaseChatProvider");
  }

  return context;
}

/**
 * Hook to check if Firebase Chat is ready
 */
export function useFirebaseChatReady(): boolean {
  const { isConnected, firebaseUser } = useFirebaseChat();
  return isConnected && firebaseUser !== null;
}
