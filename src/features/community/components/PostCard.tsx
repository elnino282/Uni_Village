import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import type { CommunityPost, PostLocation } from '../types';
import { PostActions } from './PostActions';
import { PostHeader } from './PostHeader';
import { PostLocations } from './PostLocations';
import { PostMedia } from './PostMedia';

interface PostCardProps {
  post: CommunityPost;
  onMenuPress: (postId: string) => void;
  onLikePress: (postId: string) => void;
  onCommentPress: (postId: string) => void;
  onLocationPress?: (location: PostLocation) => void;
  onPress?: (postId: string) => void;
}

/**
 * Complete post card component
 */
export function PostCard({
  post,
  onMenuPress,
  onLikePress,
  onCommentPress,
  onLocationPress,
  onPress,
}: PostCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    if (onPress) {
      onPress(post.id);
    } else {
      // Default to comment press for navigation
      onCommentPress(post.id);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          ...Shadows.sm,
        },
      ]}
    >
      <PostHeader
        author={post.author}
        createdAt={post.createdAt}
        onMenuPress={() => onMenuPress(post.id)}
      />

      {/* Post content text */}
      <View style={styles.contentContainer}>
        <Text style={[styles.content, { color: colors.textPrimary }]}>
          {post.content}
        </Text>
      </View>

      {/* Post image */}
      {post.imageUrl && <PostMedia imageUrl={post.imageUrl} />}

      {/* Location tags */}
      <PostLocations
        locations={post.locations}
        onLocationPress={onLocationPress}
      />

      {/* Like and comment actions */}
      <PostActions
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        isLiked={post.isLiked}
        onLikePress={() => onLikePress(post.id)}
        onCommentPress={() => onCommentPress(post.id)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl, // 16px
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  contentContainer: {
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.sm,
  },
  content: {
    fontSize: Typography.sizes.base, // 16px
    fontWeight: Typography.weights.normal,
    lineHeight: 26,
  },
});
