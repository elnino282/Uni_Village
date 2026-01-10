/**
 * ChatHeader Component
 * Custom header with back button, avatar, name, online status, and info button
 * Matches Figma node 317:2269
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/shared/components/ui';
import { Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

import type { ChatThread } from '../types';

interface ChatHeaderProps {
  thread: ChatThread;
  onInfoPress?: () => void;
}

/**
 * Chat header with peer info and actions
 */
export function ChatHeader({ thread, onInfoPress }: ChatHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.back();
  };

  const handleInfo = () => {
    if (onInfoPress) {
      onInfoPress();
    } else {
       
      console.log('Info pressed for thread:', thread.id);
    }
  };

  // Online status color from Figma: #00A63E
  const onlineStatusColor = thread.onlineStatus === 'online' ? '#00A63E' : colors.textSecondary;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: colors.background,
          borderBottomColor: colors.borderLight,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Back button */}
        <Pressable
          onPress={handleBack}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>

        {/* Avatar + Name + Status */}
        <View style={styles.userInfo}>
          <Avatar
            source={thread.peer.avatarUrl}
            name={thread.peer.displayName}
            size="md"
          />
          <View style={styles.textContainer}>
            <Text
              style={[styles.name, { color: colors.text }]}
              numberOfLines={1}
            >
              {thread.peer.displayName}
            </Text>
            <Text
              style={[styles.status, { color: onlineStatusColor }]}
              numberOfLines={1}
            >
              {thread.onlineStatusText}
            </Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Info button */}
        <Pressable
          onPress={handleInfo}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Thông tin cuộc trò chuyện"
          accessibilityRole="button"
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: Spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  textContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.normal,
    lineHeight: 24,
  },
  status: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.normal,
    lineHeight: 16,
  },
  spacer: {
    flex: 1,
  },
});
