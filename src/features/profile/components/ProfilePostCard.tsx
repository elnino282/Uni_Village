/**
 * ProfilePostCard Component
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/shared/components/ui';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

import type { ProfilePost } from '../types';

interface ProfilePostCardProps {
  post: ProfilePost;
  onMenuPress?: (postId: string) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
}

export function ProfilePostCard({ post, onMenuPress }: ProfilePostCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const likeIcon = post.reactions.isLiked ? 'heart' : 'heart-outline';
  const likeColor = post.reactions.isLiked ? colors.heartLiked : colors.textSecondary;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.borderLight },
        Shadows.sm,
      ]}
    >
      <View style={styles.header}>
        <Avatar
          size="md"
          source={post.author.avatarUrl}
          name={post.author.name}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.authorName, { color: colors.textPrimary }]}>
            {post.author.name}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {formatTimeAgo(post.createdAt)}
          </Text>
        </View>
        <Pressable
          style={styles.menuButton}
          onPress={() => onMenuPress?.(post.id)}
          accessibilityLabel="Tùy chọn bài viết"
          accessibilityRole="button"
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Text style={[styles.content, { color: colors.textPrimary }]}>
        {post.content}
      </Text>

      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.media}
          contentFit="cover"
          transition={200}
        />
      ) : null}

      {post.locations.length > 0 && (
        <View style={styles.locations}>
          {post.locations.map((location) => (
            <View
              key={location.id}
              style={[
                styles.locationChip,
                {
                  backgroundColor: colors.locationChipGradientStart,
                  borderColor: colors.locationChipBorder,
                },
              ]}
            >
              <Ionicons name="location" size={14} color={colors.locationChipText} />
              <Text style={[styles.locationText, { color: colors.locationChipText }]}>
                {location.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.reactions}>
        <View style={styles.reactionItem}>
          <Ionicons name={likeIcon} size={18} color={likeColor} />
          <Text style={[styles.reactionText, { color: colors.textSecondary }]}>
            {post.reactions.likes}
          </Text>
        </View>
        <View style={styles.reactionItem}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.reactionText, { color: colors.textSecondary }]}>
            {post.reactions.comments}
          </Text>
        </View>
        {typeof post.reactions.shares === 'number' && (
          <View style={styles.reactionItem}>
            <Ionicons name="paper-plane-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.reactionText, { color: colors.textSecondary }]}>
              {post.reactions.shares}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.cardPadding,
    gap: Spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    lineHeight: 24,
  },
  time: {
    fontSize: Typography.sizes.sm,
    lineHeight: 18,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.sm,
    fontSize: Typography.sizes.base,
    lineHeight: 24,
  },
  media: {
    width: '100%',
    height: 200,
    marginTop: Spacing.sm,
  },
  locations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.sm,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  locationText: {
    fontSize: Typography.sizes.sm,
    lineHeight: 18,
  },
  reactions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.cardPadding,
    paddingVertical: Spacing.md,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionText: {
    fontSize: Typography.sizes.sm,
  },
});
