import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/shared/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import type { PostAuthor } from '../types';
import { formatTimeAgo } from '../utils/formatTime';

interface PostHeaderProps {
  author: PostAuthor;
  createdAt: string;
  onMenuPress: () => void;
}

/**
 * Post header with avatar, author name, timestamp, and menu button
 */
export function PostHeader({ author, createdAt, onMenuPress }: PostHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Avatar
        size="md"
        source={author.avatarUrl}
        name={author.displayName}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>
          {author.displayName}
        </Text>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          • {formatTimeAgo(createdAt)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons
          name="more-horiz"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.cardPadding,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.base, // 16px
    fontWeight: Typography.weights.normal,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: Typography.sizes.md, // 14px
    fontWeight: Typography.weights.normal,
    lineHeight: 20,
  },
  menuButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
