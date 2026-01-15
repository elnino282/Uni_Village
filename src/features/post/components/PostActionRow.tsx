/**
 * PostActionRow Component
 * Action buttons row: Like, Comment, Share - with counts
 */

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

interface PostActionRowProps {
  isLiked: boolean;
  onLikePress: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
}

export function PostActionRow({
  isLiked,
  onLikePress,
  onCommentPress,
  onSharePress,
  likesCount,
  commentsCount,
  sharesCount,
}: PostActionRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const likeIconColor = isLiked ? colors.heartLiked : colors.actionButtonText;
  const likeTextColor = isLiked ? colors.heartLiked : colors.actionButtonText;

  return (
    <View style={[styles.container, { borderTopColor: colors.chipBackground }]}>
      {/* Like Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onLikePress}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={isLiked ? 'favorite' : 'favorite-border'}
          size={18}
          color={likeIconColor}
        />
        {likesCount !== undefined && (
          <Text style={[styles.countText, { color: likeTextColor }]}>{likesCount}</Text>
        )}
        <Text style={[styles.actionText, { color: likeTextColor }]}>Thích</Text>
      </TouchableOpacity>

      {/* Comment Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onCommentPress}
        activeOpacity={0.7}
      >
        <MaterialIcons name="chat-bubble-outline" size={18} color={colors.actionButtonText} />
        {commentsCount !== undefined && (
          <Text style={[styles.countText, { color: colors.actionButtonText }]}>{commentsCount}</Text>
        )}
        <Text style={[styles.actionText, { color: colors.actionButtonText }]}>Bình luận</Text>
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onSharePress}
        activeOpacity={0.7}
      >
        <Ionicons name="paper-plane-outline" size={18} color={colors.actionButtonText} />
        {sharesCount !== undefined && (
          <Text style={[styles.countText, { color: colors.actionButtonText }]}>{sharesCount}</Text>
        )}
        <Text style={[styles.actionText, { color: colors.actionButtonText }]}>Chia sẻ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.sm, // 8px
    paddingVertical: Spacing.sm, // 8px
    borderTopWidth: 0.8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs, // 4px
    paddingHorizontal: Spacing.sm, // 8px
    borderRadius: BorderRadius.md + 2, // 10px
    gap: 5,
  },
  countText: {
    fontSize: Typography.sizes['13'], // 13px
    fontWeight: Typography.weights.medium,
    lineHeight: 19.5,
  },
  actionText: {
    fontSize: Typography.sizes['13'], // 13px
    fontWeight: Typography.weights.normal,
    lineHeight: 19.5,
  },
});
