import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ItineraryShareCard } from '@/features/itinerary/components/ItineraryShareCard';
import { ChannelInviteCard } from '@/shared/components/channel';
import { PostActionRow } from '@/shared/components/post';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import type { CommunityPost, PostLocation } from '../types';
import { PostHeader } from './PostHeader';
import { PostLocations } from './PostLocations';
import { PostMedia } from './PostMedia';

interface PostCardProps {
  post: CommunityPost;
  onMenuPress: (postId: string) => void;
  onLikePress: (postId: string) => void;
  onCommentPress: (postId: string) => void;
  onSharePress?: (postId: string) => void;
  onLocationPress?: (location: PostLocation) => void;
  onPress?: (postId: string) => void;
  onViewItineraryDetails?: () => void;
  onOpenItinerary?: () => void;
  onMessage?: () => void;
}

function TagChips({ tags, colors }: { tags: string[]; colors: { actionBlue: string } }) {
  if (!tags || tags.length === 0) return null;
  return (
    <View style={tagStyles.container}>
      <Text style={[tagStyles.text, { color: colors.actionBlue }]}>
        {tags.join(' • ')}
      </Text>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.sm,
  },
  text: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
});

export function PostCard({
  post,
  onMenuPress,
  onLikePress,
  onCommentPress,
  onSharePress,
  onLocationPress,
  onPress,
  onViewItineraryDetails,
  onOpenItinerary,
  onMessage,
}: PostCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    if (onPress) {
      onPress(post.id);
    } else {
      onCommentPress(post.id);
    }
  };

  return (
    <TouchableOpacity
      testID="post-card"
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

      {post.tags && post.tags.length > 0 && (
        <TagChips tags={post.tags} colors={colors} />
      )}

      <View style={styles.contentContainer}>
        <Text style={[styles.content, { color: colors.textPrimary }]}>
          {post.content}
        </Text>
      </View>

      {post.itineraryShare && (
        <ItineraryShareCard
          itinerary={post.itineraryShare}
          onViewDetails={onViewItineraryDetails || (() => { })}
          onOpenItinerary={onOpenItinerary || (() => { })}
          onMessage={onMessage}
        />
      )}

      {post.channelInvite && (
        <ChannelInviteCard invite={post.channelInvite} />
      )}

      {post.imageUrl && <PostMedia imageUrl={post.imageUrl} />}

      <PostLocations
        locations={post.locations}
        onLocationPress={onLocationPress}
      />

      <PostActionRow
        variant="compact"
        showBorder={false}
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        sharesCount={post.sharesCount}
        isLiked={post.isLiked}
        onLikePress={() => onLikePress(post.id)}
        onCommentPress={() => onCommentPress(post.id)}
        onSharePress={() => onSharePress?.(post.id)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  contentContainer: {
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.sm,
  },
  content: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.normal,
    lineHeight: 26,
  },
});
