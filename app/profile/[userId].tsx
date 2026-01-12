import { PublicProfileScreen } from '@/features/profile';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

/**
 * Public profile screen route
 * Route: /profile/[userId]
 */
export default function PublicProfileRoute() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PublicProfileScreen userId={userId ?? ''} />
    </>
  );
}
