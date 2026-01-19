/**
 * PostDetailScreen Component
 * Main screen displaying post detail with comments
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth';
import { useMyProfile } from '@/features/profile';
import { LoadingScreen } from '@/shared/components/feedback';
import { Colors, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import {
  useCreateComment,
  useDeletePost,
  usePostComments,
  usePostDetail,
  useUpdatePost,
} from '../hooks';
import { useLikeComment, useLikePost } from '../hooks/useReactions';
import type { CommentRequest, PostLocation, PostVisibility } from '../types';

import { EditPrivacySheet } from '@/features/community/components/EditPrivacySheet';
import { PostOverflowMenu } from '@/features/community/components/PostOverflowMenu';
import { PostOwnerMenu } from '@/features/community/components/PostOwnerMenu';
import { useBlockPost, useReportPost, useSavePost } from '@/features/community/hooks';
import { PostActionRow, PostLocationDetailSheet } from '@/shared/components/post';
import { PostType, Visibility } from '@/shared/types/backend.types';
import { mapCommentResponseToComment } from '../adapters/commentAdapter';
import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';
import { CommentListHeader } from './CommentListHeader';
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
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const { profile: myProfile } = useMyProfile();
  const currentUserId = currentUser?.id ?? myProfile?.userId;

  // State
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOwnerMenuOpen, setIsOwnerMenuOpen] = useState(false);
  const [isEditPrivacyOpen, setIsEditPrivacyOpen] = useState(false);
  const [selectedPostVisibility, setSelectedPostVisibility] = useState<PostVisibility>('public');
  const [selectedLocation, setSelectedLocation] = useState<PostLocation | null>(null);
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

  // Queries & mutations
  const { data: post, isLoading: isPostLoading, refetch: refetchPost } = usePostDetail(postId);
  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    fetchNextPage,
    hasNextPage,
    refetch: refetchComments
  } = usePostComments(postId);

  const togglePostLikeMutation = useLikePost();
  const createCommentMutation = useCreateComment();
  const toggleCommentLikeMutation = useLikeComment();
  const { mutate: updatePost, isPending: isUpdatingPost } = useUpdatePost();
  const { mutate: deletePost, isPending: isDeletingPost } = useDeletePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: reportPost, isPending: isReportingPost } = useReportPost();
  const { mutate: blockPost, isPending: isBlockingPost } = useBlockPost();

  const isPostOwner = useMemo(() => {
    if (!post?.authorId || !currentUserId) return false;
    return String(post.authorId) === String(currentUserId);
  }, [post?.authorId, currentUserId]);

  // Flatten comments for FlatList - MUST be before any early returns to follow React hooks rules
  const flattenedComments = useMemo(
    () => commentsData?.pages.flatMap((page) => page.content) || [],
    [commentsData?.pages]
  );
  const uiComments = useMemo(
    () => flattenedComments.map(mapCommentResponseToComment),
    [flattenedComments]
  );

  // Handlers
  const handleLikePress = useCallback(() => {
    if (post?.id) {
      togglePostLikeMutation.mutate(post.id);
    }
  }, [togglePostLikeMutation, post?.id]);

  const handleMenuPress = useCallback(() => {
    if (!post) return;
    if (isPostOwner) {
      setSelectedPostVisibility(post.visibility === Visibility.PUBLIC ? 'public' : 'private');
      setIsOwnerMenuOpen(true);
    } else {
      setIsMenuOpen(true);
    }
  }, [post, isPostOwner]);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
    setIsOwnerMenuOpen(false);
  }, []);

  const handleCommentPress = useCallback(() => {
    // Scroll to comments section
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSharePress = useCallback(() => {
    // TODO: Implement share functionality
    console.log('Share pressed');
  }, []);

  const handleLocationPress = useCallback((location: PostLocation) => {
    setSelectedLocation(location);
    setIsLocationSheetOpen(true);
  }, []);

  const handleCloseLocationSheet = useCallback(() => {
    setIsLocationSheetOpen(false);
    setSelectedLocation(null);
  }, []);

  const handleCommentLike = useCallback(
    (commentId: number) => {
      if (post?.id) {
        toggleCommentLikeMutation.mutate({ commentId, postId: post.id });
      }
    },
    [toggleCommentLikeMutation, post?.id]
  );

  const handleReplyPress = useCallback((commentId: string) => {
    setReplyingToId(commentId);
  }, []);

  const handleReportComment = useCallback((commentId: string) => {
    // TODO: Implement report functionality
    console.log('Report comment:', commentId);
  }, []);

  const handleSavePost = useCallback(
    (postIdOverride?: string) => {
      const targetPostId = postIdOverride ?? (post?.id ? String(post.id) : undefined);
      if (!targetPostId || isSavingPost) return;
      savePost(targetPostId);
    },
    [post?.id, savePost, isSavingPost]
  );

  const handleReportPost = useCallback(
    (postIdOverride?: string) => {
      const targetPostId = postIdOverride ?? (post?.id ? String(post.id) : undefined);
      if (!targetPostId || isReportingPost) return;
      reportPost({ postId: targetPostId, reason: 'Inappropriate content' });
    },
    [post?.id, reportPost, isReportingPost]
  );

  const handleBlockPost = useCallback(
    (postIdOverride?: string) => {
      const targetPostId = postIdOverride ?? (post?.id ? String(post.id) : undefined);
      if (!targetPostId || isBlockingPost) return;
      blockPost(targetPostId);
    },
    [post?.id, blockPost, isBlockingPost]
  );

  const handleEditPrivacy = useCallback(() => {
    if (!post) return;
    setSelectedPostVisibility(post.visibility === Visibility.PUBLIC ? 'public' : 'private');
    setIsEditPrivacyOpen(true);
  }, [post]);

  const handleCloseEditPrivacy = useCallback(() => {
    setIsEditPrivacyOpen(false);
  }, []);

  const handleEditPost = useCallback(() => {
    if (!post?.id) return;
    router.push({ pathname: '/post/edit', params: { postId: String(post.id) } } as any);
  }, [post?.id, router]);

  const handleMoveToTrash = useCallback(() => {
    if (!post?.id || isDeletingPost) return;
    Alert.alert('Delete post', 'This will permanently delete your post.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePost(post.id),
      },
    ]);
  }, [post?.id, deletePost, isDeletingPost]);

  const handleUpdateVisibility = useCallback(
    (visibility: PostVisibility) => {
      if (!post?.id || isUpdatingPost) return;
      updatePost({
        postId: post.id,
        data: {
          postType: post.postType ?? PostType.EXPERIENCE,
          visibility: visibility === 'public' ? Visibility.PUBLIC : Visibility.PRIVATE,
        },
      });
    },
    [post?.id, post?.postType, updatePost, isUpdatingPost]
  );

  const handleSubmitComment = useCallback(
    (content: string) => {
      if (!post?.id) return;

      const commentRequest: CommentRequest = {
        postId: post.id,
        content,
        // Ensure parentCommentId is a number if your API expects number
        // If replyingToId is string (from UI), parse it.
        parentCommentId: replyingToId ? parseInt(replyingToId, 10) : undefined
      };

      createCommentMutation.mutate(
        commentRequest,
        {
          onSuccess: () => {
            setReplyingToId(null);
          },
        }
      );
    },
    [createCommentMutation, replyingToId, post?.id]
  );

  const handleCancelReply = useCallback(() => {
    setReplyingToId(null);
  }, []);

  // Render loading state
  if (isPostLoading || !post) {
    return <LoadingScreen message="Đang tải bài viết..." />;
  }

  // Count total comments using post stats when available
  const totalComments = post.commentCount ?? flattenedComments.length;

  const renderComment = ({ item }: { item: ReturnType<typeof mapCommentResponseToComment> }) => (
    <CommentItem
      comment={item}
      onLikePress={(id) => handleCommentLike(parseInt(id, 10))}
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
          authorName={post.authorName}
          authorAvatarUrl={post.authorAvatarUrl}
          createdAt={post.createdAt}
          visibility={post.visibility === Visibility.PUBLIC ? 'public' : 'private'}
        />

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>
        </View>

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <PostDetailMedia mediaUrls={post.mediaUrls} />
        )}

        {/* Location chips */}
        {post.locations && post.locations.length > 0 && (
          <PostLocationChips
            locations={post.locations as PostLocation[]}
            onLocationPress={handleLocationPress}
          />
        )}

        {/* Action row with stats */}
        <PostActionRow
          variant="full"
          isLiked={post.isLiked ?? false}
          onLikePress={handleLikePress}
          onCommentPress={handleCommentPress}
          onSharePress={handleSharePress}
          likesCount={post.reactionCount ?? 0}
          commentsCount={post.commentCount ?? 0}
          sharesCount={0} // Placeholder
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
      <PostDetailHeader onMenuPress={handleMenuPress} />

      {/* Main content */}
      <FlatList
        ref={flatListRef}
        data={uiComments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id || Math.random().toString()}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<View style={styles.listFooter} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isPostLoading}
            onRefresh={() => {
              refetchPost();
              refetchComments();
            }}
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

      <PostOverflowMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        postId={post?.id ? String(post.id) : ''}
        onSave={(postId) => handleSavePost(postId)}
        onReport={(postId) => handleReportPost(postId)}
        onBlock={(postId) => handleBlockPost(postId)}
      />

      <PostOwnerMenu
        isOpen={isOwnerMenuOpen}
        onClose={handleMenuClose}
        postId={post?.id ? String(post.id) : ''}
        onSave={(postId) => handleSavePost(postId)}
        onEditPrivacy={() => handleEditPrivacy()}
        onEditPost={() => handleEditPost()}
        onMoveToTrash={() => handleMoveToTrash()}
      />

      <EditPrivacySheet
        isOpen={isEditPrivacyOpen}
        onClose={handleCloseEditPrivacy}
        postId={post?.id ? String(post.id) : ''}
        currentVisibility={selectedPostVisibility}
        onSave={(_, visibility) => handleUpdateVisibility(visibility)}
      />

      <PostLocationDetailSheet
        isOpen={isLocationSheetOpen}
        location={selectedLocation}
        onClose={handleCloseLocationSheet}
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
