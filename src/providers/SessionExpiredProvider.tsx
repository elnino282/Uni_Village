/**
 * Session Expired Provider
 * Handles session expiration by showing an alert and redirecting to login
 */

import { useAuthStore } from "@/features/auth/store/authStore";
import { sessionEvents } from "@/lib/events/sessionEvents";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";

interface SessionExpiredProviderProps {
  children: React.ReactNode;
}

export function SessionExpiredProvider({
  children,
}: SessionExpiredProviderProps) {
  const router = useRouter();
  const clear = useAuthStore((state) => state.clear);
  const isHandlingRef = useRef(false);

  const handleSessionExpired = useCallback(async () => {
    // Prevent multiple alerts
    if (isHandlingRef.current) {
      return;
    }
    isHandlingRef.current = true;

    // Clear auth state immediately to prevent further API calls
    await clear();

    Alert.alert(
      "Phiên đăng nhập hết hạn",
      "Phiên đăng nhập của bạn đã hết hạn hoặc tài khoản đã được đăng nhập ở thiết bị khác. Vui lòng đăng nhập lại.",
      [
        {
          text: "Đăng nhập lại",
          onPress: () => {
            router.replace("/(auth)/login");
            // Reset flag after navigation
            setTimeout(() => {
              isHandlingRef.current = false;
            }, 1000);
          },
        },
      ],
      { cancelable: false },
    );
  }, [clear, router]);

  useEffect(() => {
    const unsubscribe = sessionEvents.subscribe(handleSessionExpired);
    return unsubscribe;
  }, [handleSessionExpired]);

  return <>{children}</>;
}
