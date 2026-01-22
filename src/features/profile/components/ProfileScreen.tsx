import { Colors, Spacing } from "@/shared/constants";
import { useColorScheme } from "@/shared/hooks";
import { Href, router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, vs } from "react-native-size-matters";
import { useMyPosts, useMyProfile, useProfileShareSheet } from "../hooks";
import type { ProfilePost } from "../types";
import { ProfileActionButtons } from "./ProfileActionButtons";
import { ProfileEmptyPostCard } from "./ProfileEmptyPostCard";
import { ProfileHeaderIcons } from "./ProfileHeaderIcons";
import { ProfileInfo } from "./ProfileInfo";
import { ProfilePostCard } from "./ProfilePostCard";
import { ProfileShareSheet } from "./ProfileShareSheet";
import { ProfileTabKey, ProfileTabs } from "./ProfileTabs";

export function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState<ProfileTabKey>("my-posts");

  // Fetch current user's profile
  const { profile, isLoading: isProfileLoading } = useMyProfile();

  // Fetch user's posts based on active tab
  const { data: posts = [], isLoading: isPostsLoading } = useMyPosts(activeTab);

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
    console.log("Post menu pressed:", postId);
  }, []);

  const renderPostItem = useCallback(
    ({ item }: { item: ProfilePost }) => (
      <ProfilePostCard post={item} onMenuPress={handleMenuPress} />
    ),
    [handleMenuPress]
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
      {profile && (
        <ProfileInfo profile={profile} style={styles.profileInfo} />
      )}

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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

