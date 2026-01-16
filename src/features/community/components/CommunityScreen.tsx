import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ItineraryDetailsSheet } from '@/features/itinerary/components/ItineraryDetailsSheet';
import type { ItineraryShareData } from '@/features/itinerary/types/itinerary.types';
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
import type { CommunityPost, CommunityTab, ContentFilterTab, PostLocation } from '../types';

import { CommunityFAB } from './CommunityFAB';
import { CommunityHeader } from './CommunityHeader';
import { CommunitySearchBar } from './CommunitySearchBar';
import { CommunitySegmentedTabs } from './CommunitySegmentedTabs';
import { ContentTabChips } from './ContentTabChips';
import { MessagesTab } from './MessagesTab';
import { PostCard } from './PostCard';
import { PostOverflowMenu } from './PostOverflowMenu';

export function CommunityScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<CommunityTab>('posts');
  const [contentFilterTab, setContentFilterTab] = useState<ContentFilterTab>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<ItineraryShareData | null>(null);

  // Dynamic search placeholder based on content filter tab
  const getSearchPlaceholder = () => {
    switch (contentFilterTab) {
      case 'itineraries':
        return 'Tìm kiếm lịch trình...';
      case 'channels':
        return 'Tìm kiếm Channel...';
      default:
        return 'Tìm kiếm bài viết...';
    }
  };

  const { data, isLoading, refetch, isRefetching } = useCommunityPosts();
  const likePostMutation = useLikePost();
  const savePostMutation = useSavePost();
  const reportPostMutation = useReportPost();
  const blockPostMutation = useBlockPost();

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
      router.push(`/post/${postId}` as any);
    },
    [router]
  );

  const handleLocationPress = useCallback(
    (location: PostLocation) => {
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

  const handleViewItineraryDetails = useCallback((itinerary: ItineraryShareData) => {
    setSelectedItinerary(itinerary);
    setIsSheetVisible(true);
  }, []);

  const handleOpenItinerary = useCallback((itinerary: ItineraryShareData) => {
    setSelectedItinerary(itinerary);
    setIsSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetVisible(false);
    setSelectedItinerary(null);
  }, []);

  const handleOpenMap = useCallback(() => {
    console.log('Open map for itinerary');
    handleCloseSheet();
  }, [handleCloseSheet]);

  const handleSaveItinerary = useCallback(() => {
    console.log('Save itinerary');
  }, []);

  const renderPostItem = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard
        post={item}
        onMenuPress={handleMenuPress}
        onLikePress={handleLikePress}
        onCommentPress={handleCommentPress}
        onLocationPress={handleLocationPress}
        onViewItineraryDetails={
          item.itineraryShare
            ? () => handleViewItineraryDetails(item.itineraryShare!)
            : undefined
        }
        onOpenItinerary={
          item.itineraryShare
            ? () => handleOpenItinerary(item.itineraryShare!)
            : undefined
        }
      />
    ),
    [handleMenuPress, handleLikePress, handleCommentPress, handleLocationPress, handleViewItineraryDetails, handleOpenItinerary]
  );

  const keyExtractor = useCallback((item: CommunityPost) => item.id, []);

  // Filter posts by search query first
  const searchFilteredPosts = data?.data.filter((post) =>
    searchQuery
      ? post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  ) || [];

  // Then filter by content type based on active chip
  const filteredPosts = searchFilteredPosts.filter((post) => {
    switch (contentFilterTab) {
      case 'itineraries':
        return !!post.itineraryShare;
      case 'channels':
        return !!post.channelInvite;
      default:
        // 'posts' = only pure posts (no itinerary, no channel)
        return !post.itineraryShare && !post.channelInvite;
    }
  });

  if (isLoading) {
    return <LoadingScreen message="Đang tải bài viết..." />;
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <View testID="community-screen" style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
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
              placeholder={getSearchPlaceholder()}
            />

            <ContentTabChips
              activeTab={contentFilterTab}
              onTabChange={setContentFilterTab}
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
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {contentFilterTab === 'itineraries'
                      ? 'Không có bài đăng chia sẻ lịch trình'
                      : contentFilterTab === 'channels'
                        ? 'Không có bài đăng mời tham gia Channel'
                        : 'Không có bài viết'}
                  </Text>
                </View>
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

            <ItineraryDetailsSheet
              isVisible={isSheetVisible}
              itinerary={selectedItinerary}
              onClose={handleCloseSheet}
              onOpenMap={handleOpenMap}
              onSave={handleSaveItinerary}
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
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
