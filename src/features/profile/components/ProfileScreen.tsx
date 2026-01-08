/**
 * ProfileScreen Component
 * Main profile screen composing all sub-components
 */

import { Colors } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockProfile } from '../services/mockProfile';
import { ProfileActionButtons } from './ProfileActionButtons';
import { ProfileEmptyPostCard } from './ProfileEmptyPostCard';
import { ProfileFAB } from './ProfileFAB';
import { ProfileHeaderIcons } from './ProfileHeaderIcons';
import { ProfileInfo } from './ProfileInfo';
import { ProfileTabKey, ProfileTabs } from './ProfileTabs';

export function ProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [activeTab, setActiveTab] = useState<ProfileTabKey>('my-posts');

    // TODO: Replace with actual profile data from useProfile hook
    const profile = mockProfile;

    // Handlers (TODO: Implement actual navigation/actions)
    const handleAnalyticsPress = () => {
        // TODO: Navigate to analytics screen
        console.log('Analytics pressed');
    };

    const handleSearchPress = () => {
        // TODO: Navigate to search screen
        console.log('Search pressed');
    };

    const handleSettingsPress = () => {
        // TODO: Navigate to settings screen
        console.log('Settings pressed');
    };

    const handleEditProfilePress = () => {
        router.push('/profile/edit');
    };

    const handleShareProfilePress = async () => {
        // TODO: Implement proper share with profile URL
        try {
            await Share.share({
                message: `Check out ${profile.displayName}'s profile on UniVillage!`,
            });
        } catch (error) {
            console.error('Error sharing profile:', error);
        }
    };

    const handleFABPress = () => {
        // TODO: Navigate to add friend / create post screen
        console.log('FAB pressed');
    };

    const handleCreatePost = () => {
        // TODO: Navigate to create post screen
        console.log('Create post pressed');
    };

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
                    <View style={styles.profileSection}>
                        <ProfileInfo profile={profile} />
                        <ProfileFAB onPress={handleFABPress} />
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
    profileSection: {
        position: 'relative',
    },
});
