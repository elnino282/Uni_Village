import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LoadingScreen } from '@/shared/components/feedback';
import { Colors, Spacing } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import {
    useBlockPost,
    useCommunityPosts,
    useLikePost,
    useReportPost,
    useSavePost,
} from '../hooks';
import type { CommunityPost, CommunityTab, PostLocation } from '../types';

import { CommunityFAB } from './CommunityFAB';
import { CommunityHeader } from './CommunityHeader';
import { CommunitySearchBar } from './CommunitySearchBar';
import { CommunitySegmentedTabs } from './CommunitySegmentedTabs';
import { MessagesTab } from './MessagesTab';
import { PostCard } from './PostCard';
import { PostOverflowMenu } from './PostOverflowMenu';

/**
 * Main Community screen component
 */
export function CommunityScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState<CommunityTab>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // React Query hooks
  const { data, isLoading, refetch, isRefetching } = useCommunityPosts();
  const likePostMutation = useLikePost();
  const savePostMutation = useSavePost();
  const reportPostMutation = useReportPost();
  const blockPostMutation = useBlockPost();

  // Handlers
  const handleMenuPress = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setIsMenuOpen(true);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
    setSelectedPostId(null);
  }, []);

  const handleLikePress = useCallback(
    (postId: string) => {
      likePostMutation.mutate(postId);
    },
    [likePostMutation]
  );

  const handleCommentPress = useCallback(
    (postId: string) => {
      // Navigate to comments or open comment sheet
      console.log('Comment pressed for post:', postId);
    },
    []
  );

  const handleLocationPress = useCallback(
    (location: PostLocation) => {
      // Navigate to map with location
      console.log('Location pressed:', location.name);
    },
    []
  );

  const handleSavePost = useCallback(
    (postId: string) => {
      savePostMutation.mutate(postId);
    },
    [savePostMutation]
  );

  const handleReportPost = useCallback(
    (postId: string) => {
      reportPostMutation.mutate({ postId, reason: 'Inappropriate content' });
    },
    [reportPostMutation]
  );

  const handleBlockPost = useCallback(
    (postId: string) => {
      blockPostMutation.mutate(postId);
    },
    [blockPostMutation]
  );

  const handleCreatePost = useCallback(() => {
    router.push('/post/create' as any);
  }, [router]);

  const renderPostItem = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard
        post={item}
        onMenuPress={handleMenuPress}
        onLikePress={handleLikePress}
        onCommentPress={handleCommentPress}
        onLocationPress={handleLocationPress}
      />
    ),
    [handleMenuPress, handleLikePress, handleCommentPress, handleLocationPress]
  );

  const keyExtractor = useCallback((item: CommunityPost) => item.id, []);

  // Filter posts by search query
  const filteredPosts = data?.data.filter((post) =>
    searchQuery
      ? post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (isLoading) {
    return <LoadingScreen message="Đang tải bài viết..." />;
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <CommunityHeader />

        <CommunitySegmentedTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'posts' ? (
          <>
            <CommunitySearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={filteredPosts}
              renderItem={renderPostItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  tintColor={colors.actionBlue}
                />
              }
            />

            <CommunityFAB onPress={handleCreatePost} />

            <PostOverflowMenu
              isOpen={isMenuOpen}
              onClose={handleMenuClose}
              postId={selectedPostId || ''}
              onSave={handleSavePost}
              onReport={handleReportPost}
              onBlock={handleBlockPost}
            />
          </>
        ) : (
          <MessagesTab />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: 100, // Space for FAB
  },
});
