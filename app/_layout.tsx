// app/_layout.tsx
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useAuthStore } from '@/features/auth';
import { Providers } from '@/providers/Providers';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const segments = useSegments();
  const { authenticated, isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [hydrate, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    if (!authenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (authenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [authenticated, isHydrated, segments]);

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </Providers>
  );
}
