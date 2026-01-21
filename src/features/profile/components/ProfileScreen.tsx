import { Colors } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import { Href, router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s, vs } from 'react-native-size-matters';
import { useMyProfile, useProfileShareSheet } from '../hooks';
import { ProfileActionButtons } from './ProfileActionButtons';
import { ProfileEmptyPostCard } from './ProfileEmptyPostCard';
import { ProfileFAB } from './ProfileFAB';
import { ProfileHeaderIcons } from './ProfileHeaderIcons';
import { ProfileInfo } from './ProfileInfo';
import { ProfileShareSheet } from './ProfileShareSheet';
import { ProfileTabKey, ProfileTabs } from './ProfileTabs';

export function ProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [activeTab, setActiveTab] = useState<ProfileTabKey>('my-posts');

    // Fetch current user's profile
    const { profile, isLoading, error } = useMyProfile();

    // Profile share sheet
    const shareSheet = useProfileShareSheet({
        userId: profile?.id,
        displayName: profile?.displayName,
    });

    // Handlers (TODO: Implement actual navigation/actions)
    const handleAnalyticsPress = () => {
        // TODO: Navigate to analytics screen
        console.log('Analytics pressed');
    };

    const handleSearchPress = () => {
        router.push('/profile/search');
    };

    const handleSettingsPress = () => {
        router.push('/settings' as Href);
    };

    const handleEditProfilePress = () => {
        router.push('/profile/edit');
    };

    const handleShareProfilePress = () => {
        if (!profile) return;
        shareSheet.open();
    };

    const handleFABPress = () => {
        // TODO: Navigate to add friend / create post screen
        console.log('FAB pressed');
    };

    const handleCreatePost = () => {
        router.push('/post/create' as Href);
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: colors.background }]}
                edges={['top']}
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.tint} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['top']}
        >
            <View style={styles.content}>
                <ProfileHeaderIcons
                    onAnalyticsPress={handleAnalyticsPress}
                    onSearchPress={handleSearchPress}
                    onSettingsPress={handleSettingsPress}
                />

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section: Info + FAB in flex row */}
                    <View style={styles.headerSection}>
                        <View style={styles.profileInfoWrapper}>
                            {profile && (
                                <ProfileInfo profile={profile} style={styles.profileInfo} />
                            )}
                        </View>
                        <View style={styles.fabContainer}>
                            <ProfileFAB onPress={handleFABPress} absolute={false} />
                        </View>
                    </View>

                    <ProfileActionButtons
                        onEditPress={handleEditProfilePress}
                        onSharePress={handleShareProfilePress}
                    />

                    <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {activeTab === 'my-posts' && (
                        <ProfileEmptyPostCard onCreatePost={handleCreatePost} />
                    )}
                    {activeTab === 'favorites' && (
                        <ProfileEmptyPostCard onCreatePost={handleCreatePost} />
                    )}
                </ScrollView>

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
    scrollView: {
        flex: 1,
    },
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: s(16),
        paddingTop: vs(20),
        paddingBottom: vs(8),
    },
    profileInfoWrapper: {
        flex: 1,
        paddingRight: s(12),
    },
    profileInfo: {
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
    },
    fabContainer: {
        alignItems: 'flex-end',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

