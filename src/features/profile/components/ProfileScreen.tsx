import { SaveSuccessModal } from "@/components/SaveSuccessModal";
import { EditPrivacySheet } from "@/features/community/components/EditPrivacySheet";
import { useSavePost } from "@/features/community/hooks";
import type { PostVisibility } from "@/features/community/types";
import { useDeletePost, useUpdatePost, useLikePost } from "@/features/post/hooks";
import { Colors, Spacing } from "@/shared/constants";
import { useColorScheme } from "@/shared/hooks";
import { showErrorToast } from "@/shared/utils";
import { Href, router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, vs } from "react-native-size-matters";
import { useMyPosts, useMyProfile, useProfileShareSheet } from "../hooks";
import type { ProfilePost } from "../types";
import { ProfileActionButtons } from "./ProfileActionButtons";
import { ProfileEmptyPostCard } from "./ProfileEmptyPostCard";
import { ProfileHeaderIcons } from "./ProfileHeaderIcons";
import { ProfileInfo } from "./ProfileInfo";
import { ProfilePostCard } from "./ProfilePostCard";
import { ProfilePostMenu } from "./ProfilePostMenu";
import { ProfileShareSheet } from "./ProfileShareSheet";
import { ProfileTabKey, ProfileTabs } from "./ProfileTabs";

export function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState<ProfileTabKey>("my-posts");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditPrivacyOpen, setIsEditPrivacyOpen] = useState(false);
  const [selectedPostVisibility, setSelectedPostVisibility] =
    useState<PostVisibility>("public");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [lastSaveResult, setLastSaveResult] = useState(false);

  // Fetch current user's profile
  const { profile, isLoading: isProfileLoading } = useMyProfile();

  // Fetch user's posts based on active tab
  const {
    data: posts = [],
    isLoading: isPostsLoading,
    refetch: refetchPosts,
  } = useMyPosts(activeTab);

  // Refetch posts when screen is focused (e.g., after editing a post)
  useFocusEffect(
    useCallback(() => {
      refetchPosts();
    }, [refetchPosts])
  );

  // Mutations
  const { mutate: savePost } = useSavePost();
  const { mutate: deletePost } = useDeletePost();
  const { mutate: updatePost } = useUpdatePost();
  const { mutate: likePost } = useLikePost();

  // Profile share sheet
  const shareSheet = useProfileShareSheet({
    userId: profile?.id,
    displayName: profile?.displayName,
  });

  // Handlers
  const handleAnalyticsPress = () => {
    console.log("Analytics pressed");
  };

  const handleSearchPress = () => {
    console.log("Search pressed");
  };

  const handleSettingsPress = () => {
    router.push("/settings" as Href);
  };

  const handleEditProfilePress = () => {
    router.push("/profile/edit");
  };

  const handleShareProfilePress = () => {
    if (!profile) return;
    shareSheet.open();
  };

  const handleCreatePost = () => {
    router.push("/post/create" as Href);
  };

  const handleMenuPress = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setIsMenuOpen(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
    setSelectedPostId(null);
  }, []);

  // Menu action handlers
  const handleSavePost = useCallback(
    (postId: string) => {
      savePost(postId, {
        onSuccess: () => {
          setLastSaveResult(true);
          setIsSaveModalOpen(true);
        },
        onError: () => {
          showErrorToast("Không thể lưu bài viết");
        },
      });
    },
    [savePost]
  );

  const handleUnsavePost = useCallback(
    (postId: string) => {
      savePost(postId, {
        onSuccess: () => {
          setLastSaveResult(false);
          setIsSaveModalOpen(true);
          refetchPosts();
        },
        onError: () => {
          showErrorToast("Không thể bỏ lưu bài viết");
        },
      });
    },
    [savePost, refetchPosts]
  );

  const handleEditPost = useCallback(
    (postId: string) => {
      router.push({ pathname: "/post/edit", params: { postId } } as any);
    },
    [router]
  );

  const handleEditPrivacy = useCallback(
    (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        const visibility: PostVisibility =
          post.visibility === "PUBLIC"
            ? "public"
            : post.visibility === "PRIVATE"
              ? "private"
              : "friends";
        setSelectedPostVisibility(visibility);
        setSelectedPostId(postId);
        setIsEditPrivacyOpen(true);
      }
    },
    [posts]
  );

  const handleCloseEditPrivacy = useCallback(() => {
    setIsEditPrivacyOpen(false);
  }, []);

  const handleUpdateVisibility = useCallback(
    (visibility: PostVisibility) => {
      if (!selectedPostId) return;

      const backendVisibility =
        visibility === "public"
          ? "PUBLIC"
          : visibility === "private"
            ? "PRIVATE"
            : "FRIENDS";

      updatePost(
        {
          postId: Number(selectedPostId),
          postType: "EXPERIENCE",
          visibility: backendVisibility,
        },
        {
          onSuccess: () => {
            setIsEditPrivacyOpen(false);
          },
          onError: () => {
            showErrorToast("Không thể cập nhật quyền riêng tư");
          },
        }
      );
    },
    [selectedPostId, updatePost]
  );

  const handleLikePost = useCallback(
    (postId: string) => {
      likePost(Number(postId), {
        onError: () => {
          showErrorToast("Không thể thích bài viết");
        },
      });
    },
    [likePost]
  );

  const handleCommentPress = useCallback(
    (postId: string) => {
      router.push({ pathname: "/post/detail", params: { postId } } as any);
    },
    []
  );

  const handleSharePost = useCallback((postId: string) => {
    // TODO: Implement share post functionality
    Alert.alert("Chia sẻ", "Chức năng chia sẻ sẽ được cập nhật.");
  }, []);

  const handleDeletePost = useCallback(
    (postId: string) => {
      Alert.alert("Xóa bài viết", "Bạn có chắc chắn muốn xóa bài viết này?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            deletePost(Number(postId), {
              onSuccess: () => {
                refetchPosts();
              },
              onError: () => {
                showErrorToast("Không thể xóa bài viết");
              },
            });
          },
        },
      ]);
    },
    [deletePost, refetchPosts]
  );

  const renderPostItem = useCallback(
    ({ item }: { item: ProfilePost }) => (
      <ProfilePostCard 
        post={item} 
        onMenuPress={handleMenuPress}
        onLikePress={handleLikePost}
        onCommentPress={handleCommentPress}
      />
    ),
    [handleMenuPress, handleLikePost, handleCommentPress]
  );

  const keyExtractor = useCallback((item: ProfilePost) => item.id, []);

  // Loading state
  if (isProfileLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  const ListHeaderComponent = (
    <View>
      {/* Profile Info Section */}
      {profile && <ProfileInfo profile={profile} style={styles.profileInfo} />}

      <ProfileActionButtons
        onEditPress={handleEditProfilePress}
        onSharePress={handleShareProfilePress}
      />

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );

  const ListEmptyComponent = isPostsLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.tint} />
    </View>
  ) : (
    <ProfileEmptyPostCard onCreatePost={handleCreatePost} />
  );

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <View style={styles.content}>
          <ProfileHeaderIcons
            onAnalyticsPress={handleAnalyticsPress}
            onSearchPress={handleSearchPress}
            onSettingsPress={handleSettingsPress}
          />

          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Profile Share Bottom Sheet */}
          {profile && (
            <ProfileShareSheet
              ref={shareSheet.bottomSheetRef}
              userId={profile.id}
              displayName={profile.displayName}
              qrViewRef={shareSheet.qrViewRef}
              onCopyLink={shareSheet.handleCopyLink}
              onShare={shareSheet.handleShare}
              onDownload={shareSheet.handleDownload}
              onScan={shareSheet.handleScan}
            />
          )}

          {/* Post Menu */}
          <ProfilePostMenu
            isOpen={isMenuOpen}
            onClose={handleCloseMenu}
            postId={selectedPostId ?? ""}
            tabType={activeTab}
            onUnsave={handleUnsavePost}
            onSave={handleSavePost}
            onEditPrivacy={handleEditPrivacy}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onShare={handleSharePost}
          />

          {/* Edit Privacy Sheet */}
          <EditPrivacySheet
            isOpen={isEditPrivacyOpen}
            onClose={handleCloseEditPrivacy}
            postId={selectedPostId ?? ""}
            currentVisibility={selectedPostVisibility}
            onSave={(_, visibility) => handleUpdateVisibility(visibility)}
          />

          {/* Save Success Modal */}
          <SaveSuccessModal
            visible={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
            isSaved={lastSaveResult}
          />
        </View>
      </SafeAreaView>
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
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.lg,
    flexGrow: 1,
  },
  profileInfo: {
    paddingHorizontal: s(16),
    paddingTop: vs(20),
    paddingBottom: vs(8),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: vs(40),
  },
});
