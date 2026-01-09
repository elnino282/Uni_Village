/**
 * PostActionRow Component
 * Action buttons row: Like, Comment, Share
 */

import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

interface PostActionRowProps {
  isLiked: boolean;
  onLikePress: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
}

export function PostActionRow({
  isLiked,
  onLikePress,
  onCommentPress,
  onSharePress,
}: PostActionRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const likeIconColor = isLiked ? colors.heartLiked : colors.actionButtonText;
  const likeTextColor = isLiked ? colors.heartLiked : colors.actionButtonText;

  return (
    <View style={[styles.container, { borderBottomColor: colors.chipBackground }]}>
      {/* Like Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onLikePress}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={isLiked ? 'favorite' : 'favorite-border'}
          size={17}
          color={likeIconColor}
        />
        <Text style={[styles.actionText, { color: likeTextColor }]}>Thích</Text>
      </TouchableOpacity>

      {/* Comment Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onCommentPress}
        activeOpacity={0.7}
      >
        <MaterialIcons name="chat-bubble-outline" size={17} color={colors.actionButtonText} />
        <Text style={[styles.actionText, { color: colors.actionButtonText }]}>Bình luận</Text>
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onSharePress}
        activeOpacity={0.7}
      >
        <MaterialIcons name="send" size={17} color={colors.actionButtonText} />
        <Text style={[styles.actionText, { color: colors.actionButtonText }]}>Chia sẻ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm, // 8px
    paddingVertical: Spacing.xs + 2, // ~6px
    borderBottomWidth: 0.8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm - 2, // 6px
    borderRadius: BorderRadius.md + 2, // 10px
    gap: 6,
  },
  actionText: {
    fontSize: Typography.sizes['13'], // 13px
    fontWeight: Typography.weights.normal,
    lineHeight: 19.5,
    textAlign: 'center',
  },
});
