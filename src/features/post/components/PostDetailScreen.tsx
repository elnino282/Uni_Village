/**
 * PostDetailScreen Component
 * Main screen displaying post detail with comments
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingScreen } from '@/shared/components/feedback';
import { Colors, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import {
  useCreateComment,
  usePostDetail,
  useToggleCommentLike,
  useTogglePostLike,
} from '../hooks';
import type { Comment, PostDetailLocation } from '../types';
import { formatTimeAgo } from '../utils/formatTime';

import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';
import { CommentListHeader } from './CommentListHeader';
import { PostActionRow } from './PostActionRow';
import { PostAuthorRow } from './PostAuthorRow';
import { PostDetailHeader } from './PostDetailHeader';
import { PostDetailMedia } from './PostDetailMedia';
import { PostLocationChips } from './PostLocationChips';

interface PostDetailScreenProps {
  postId: string;
}

export function PostDetailScreen({ postId }: PostDetailScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  // State
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // Queries & mutations
  const { data, isLoading, refetch, isRefetching } = usePostDetail(postId);
  const togglePostLikeMutation = useTogglePostLike(postId);
  const createCommentMutation = useCreateComment(postId);
  const toggleCommentLikeMutation = useToggleCommentLike(postId);

  // Handlers
  const handleLikePress = useCallback(() => {
    togglePostLikeMutation.mutate();
  }, [togglePostLikeMutation]);

  const handleCommentPress = useCallback(() => {
    // Scroll to comments section
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSharePress = useCallback(() => {
    // TODO: Implement share functionality
    console.log('Share pressed');
  }, []);

  const handleLocationPress = useCallback((location: PostDetailLocation) => {
    // TODO: Navigate to map with location
    console.log('Location pressed:', location.name);
  }, []);

  const handleCommentLike = useCallback(
    (commentId: string) => {
      toggleCommentLikeMutation.mutate(commentId);
    },
    [toggleCommentLikeMutation]
  );

  const handleReplyPress = useCallback((commentId: string) => {
    setReplyingToId(commentId);
  }, []);

  const handleReportComment = useCallback((commentId: string) => {
    // TODO: Implement report functionality
    console.log('Report comment:', commentId);
  }, []);

  const handleSubmitComment = useCallback(
    (content: string) => {
      createCommentMutation.mutate(
        { content, parentId: replyingToId ?? undefined },
        {
          onSuccess: () => {
            setReplyingToId(null);
          },
        }
      );
    },
    [createCommentMutation, replyingToId]
  );

  const handleCancelReply = useCallback(() => {
    setReplyingToId(null);
  }, []);

  // Render loading state
  if (isLoading || !data) {
    return <LoadingScreen message="Đang tải bài viết..." />;
  }

  const { post, comments } = data;

  // Flatten comments for FlatList (include replies)
  const flattenedComments = comments.flatMap((comment) => [comment]);

  // Count total comments including replies
  const totalComments = comments.reduce(
    (acc, comment) => acc + 1 + (comment.replies?.length || 0),
    0
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem
      comment={item}
      onLikePress={handleCommentLike}
      onReplyPress={handleReplyPress}
      onReportPress={handleReportComment}
    />
  );

  const ListHeader = () => (
    <>
      {/* Post Card */}
      <View style={[styles.postCard, { backgroundColor: colors.card, ...Shadows.sm }]}>
        {/* Author row */}
        <PostAuthorRow
          author={post.author}
          createdAtText={formatTimeAgo(post.createdAt)}
          visibility={post.visibility}
        />

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>
        </View>

        {/* Media */}
        {post.imageUrl && <PostDetailMedia imageUrl={post.imageUrl} />}

        {/* Location chips */}
        <PostLocationChips locations={post.locations} onLocationPress={handleLocationPress} />

        {/* Action row with stats */}
        <PostActionRow
          isLiked={post.isLiked}
          onLikePress={handleLikePress}
          onCommentPress={handleCommentPress}
          onSharePress={handleSharePress}
          likesCount={post.likesCount}
          commentsCount={post.commentsCount}
          sharesCount={post.sharesCount}
        />
      </View>

      {/* Comments section header */}
      <View style={[styles.commentsSection, { backgroundColor: colors.card }]}>
        <CommentListHeader totalComments={totalComments} />
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      {/* Header */}
      <PostDetailHeader />

      {/* Main content */}
      <FlatList
        ref={flatListRef}
        data={flattenedComments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<View style={styles.listFooter} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.tint}
          />
        }
        style={{ backgroundColor: colors.card }}
      />

      {/* Comment composer */}
      <CommentComposer
        onSubmit={handleSubmitComment}
        isSubmitting={createCommentMutation.isPending}
        replyingTo={replyingToId}
        onCancelReply={handleCancelReply}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postCard: {
    marginBottom: Spacing.sm,
  },
  contentContainer: {
    paddingHorizontal: Spacing.cardPadding - 4, // 12px
    paddingTop: Spacing.sm,
  },
  content: {
    fontSize: Typography.sizes.md, // 14px
    fontWeight: Typography.weights.normal,
    lineHeight: 22.75,
  },
  commentsSection: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  listFooter: {
    height: Spacing.lg, // 24px bottom padding
  },
});
