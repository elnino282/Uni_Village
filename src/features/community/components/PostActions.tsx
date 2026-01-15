import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

interface PostActionsProps {
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  isLiked: boolean;
  onLikePress: () => void;
  onCommentPress: () => void;
  onSharePress?: () => void;
}

/**
 * Post action row with like, comment, and share buttons
 */
export function PostActions({
  likesCount,
  commentsCount,
  sharesCount,
  isLiked,
  onLikePress,
  onCommentPress,
  onSharePress,
}: PostActionsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handleSharePress = () => {
    if (onSharePress) {
      onSharePress();
    } else {
      console.log('Share pressed');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onLikePress}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={isLiked ? 'favorite' : 'favorite-border'}
          size={20}
          color={isLiked ? colors.error : colors.textSecondary}
        />
        <Text style={[styles.actionText, { color: colors.textSecondary }]}>
          {likesCount}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onCommentPress}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="chat-bubble-outline"
          size={20}
          color={colors.textSecondary}
        />
        <Text style={[styles.actionText, { color: colors.textSecondary }]}>
          {commentsCount}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleSharePress}
        activeOpacity={0.7}
      >
        <Ionicons
          name="paper-plane-outline"
          size={20}
          color={colors.textSecondary}
        />
        {sharesCount !== undefined && (
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            {sharesCount}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.cardPadding,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: Typography.sizes.base, // 16px
    fontWeight: Typography.weights.normal,
    lineHeight: 24,
  },
});

