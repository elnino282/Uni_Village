/**
 * PublicProfileHeader Component
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/shared/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

import type { PublicProfile } from '../types';

interface PublicProfileHeaderProps {
  profile: PublicProfile;
  onMessagePress?: () => void;
}

export function PublicProfileHeader({ profile, onMessagePress }: PublicProfileHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Avatar
          source={profile.avatarUrl}
          name={profile.displayName}
          size="xl"
        />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {profile.displayName}
          </Text>
          <Text style={[styles.handle, { color: colors.textSecondary }]}>
            @{profile.username}
          </Text>
          {profile.bio ? (
            <Text style={[styles.bio, { color: colors.textPrimary }]}>
              {profile.bio}
            </Text>
          ) : null}
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.messageButton,
          { backgroundColor: colors.actionBlue },
          pressed && styles.pressed,
        ]}
        onPress={onMessagePress}
        accessibilityLabel="Nhắn tin"
        accessibilityRole="button"
      >
        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
        <Text style={styles.messageText}>Nhắn tin</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    lineHeight: 28,
  },
  handle: {
    fontSize: Typography.sizes.md,
    lineHeight: 20,
    marginTop: 2,
  },
  bio: {
    fontSize: Typography.sizes.md,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  messageButton: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    minHeight: 44,
  },
  messageText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
