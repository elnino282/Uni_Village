/**
 * ChannelInfoScreen
 * Displays channel/group information matching Figma design
 */

import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { AvatarRow } from '@/shared/components/avatar';
import { EmptyState, ErrorMessage, LoadingScreen } from '@/shared/components/feedback';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import { showErrorToast } from '@/shared/utils';
import { useChannelInfo, useJoinChannel } from '../hooks';

/**
 * Group/Channel Info screen matching Figma NODE 321-5121
 */
export function ChannelInfoScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const router = useRouter();
    const params = useLocalSearchParams<{ channelId?: string | string[] }>();
    const channelId = Array.isArray(params.channelId) ? params.channelId[0] : params.channelId;

    const { data: channelInfo, isLoading, isError, refetch } = useChannelInfo(channelId || '');
    const joinChannelMutation = useJoinChannel();

    const handleBack = () => {
        router.back();
    };

    const handleJoinChat = () => {
        if (!channelInfo) return;
        if (!channelInfo.id) {
            showErrorToast('Missing channel conversation id.');
            return;
        }
        const cacheKey = channelId || channelInfo.id;

        if (channelInfo.isJoined) {
            // Navigate to channel thread
            router.push({
                pathname: '/channel/[channelId]',
                params: { channelId: channelInfo.id },
            } as any);
        } else {
            // Join then navigate
            joinChannelMutation.mutate(
                { conversationId: channelInfo.id, cacheKey },
                {
                    onSuccess: (data) => {
                        const accepted = !data?.status || data.status === 'ACCEPTED';
                        if (!accepted) return;
                        router.push({
                            pathname: '/channel/[channelId]',
                            params: { channelId: channelInfo.id },
                        } as any);
                    },
                }
            );
        }
    };

    const handleCreatorPress = () => {
        // Navigate to creator profile (stub)
        console.log('Navigate to creator profile:', channelInfo?.creator.id);
    };

    if (!channelId) {
        return (
            <EmptyState
                title="Channel not found"
                message="Missing channel identifier."
                actionLabel="Go back"
                onAction={handleBack}
            />
        );
    }

    if (isLoading) {
        return <LoadingScreen message="Loading channel info..." />;
    }

    if (isError) {
        return (
            <ErrorMessage
                title="Unable to load channel"
                message="Please try again."
                onRetry={refetch}
            />
        );
    }

    if (!channelInfo) {
        return (
            <EmptyState
                title="Channel not found"
                message="This channel may have been removed."
                actionLabel="Go back"
                onAction={handleBack}
            />
        );
    }
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.actionBlue }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ThÃ´ng tin nhÃ³m</Text>
                <TouchableOpacity style={styles.menuButton}>
                    <MaterialIcons name="more-vert" size={24} color="#ffffff" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Preview Image Block */}
                <View style={styles.previewContainer}>
                    <View style={[styles.previewCard, { backgroundColor: colors.card }, Shadows.md]}>
                        {channelInfo.previewImageUrl && (
                            <Image
                                source={{ uri: channelInfo.previewImageUrl }}
                                style={styles.previewImage}
                                contentFit="cover"
                            />
                        )}
                    </View>
                </View>

                {/* Channel Title */}
                <Text style={[styles.channelTitle, { color: colors.textPrimary }]}>
                    {channelInfo.emoji ? `${channelInfo.emoji} ` : ''}
                    {channelInfo.name}
                </Text>

                {/* Creator */}
                <View style={styles.creatorRow}>
                    <Text style={[styles.createdByText, { color: colors.textSecondary }]}>
                        Táº¡o bá»Ÿi{' '}
                    </Text>
                    <TouchableOpacity onPress={handleCreatorPress}>
                        <Text style={[styles.creatorName, { color: colors.actionBlue }]}>
                            {channelInfo.creator.displayName}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Description */}
                <View style={[styles.descriptionContainer, { backgroundColor: colors.card }]}>
                    <Text style={[styles.descriptionText, { color: colors.textPrimary }]}>
                        {channelInfo.description}
                    </Text>
                </View>

                {/* Members Section */}
                <View style={[styles.membersContainer, { backgroundColor: colors.card }]}>
                    <Text style={[styles.membersTitle, { color: colors.textPrimary }]}>
                        ThÃ nh viÃªn ({channelInfo.memberCount.toLocaleString()})
                    </Text>
                    <View style={styles.membersRow}>
                        <AvatarRow
                            members={channelInfo.members}
                            totalCount={channelInfo.memberCount}
                            visibleCount={5}
                            avatarSize={40}
                            overlap={12}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Footer CTA */}
            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.ctaButtonWrapper}
                    onPress={handleJoinChat}
                    activeOpacity={0.8}
                    disabled={joinChannelMutation.isPending}
                >
                    <LinearGradient
                        colors={channelInfo.isJoined ? ['#3b82f6', '#2563eb'] : ['#ec4899', '#f97316']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.ctaButton}
                    >
                        <MaterialIcons
                            name={channelInfo.isJoined ? 'chat' : 'group-add'}
                            size={22}
                            color="#ffffff"
                        />
                        <Text style={styles.ctaText}>
                            {joinChannelMutation.isPending
                                ? 'Äang xá»­ lÃ½...'
                                : channelInfo.isJoined
                                    ? 'VÃ o chat'
                                    : 'Tham gia chat'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: Typography.sizes.lg, // 18px
        fontWeight: Typography.weights.semibold,
        color: '#ffffff',
        flex: 1,
        textAlign: 'center',
    },
    menuButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    previewContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    previewCard: {
        width: 200,
        height: 140,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    channelTitle: {
        fontSize: Typography.sizes['2xl'], // 24px
        fontWeight: Typography.weights.bold,
        textAlign: 'center',
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    creatorRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    createdByText: {
        fontSize: Typography.sizes.md, // 14px
        fontWeight: Typography.weights.normal,
    },
    creatorName: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
    },
    descriptionContainer: {
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    descriptionText: {
        fontSize: Typography.sizes.base, // 16px
        fontWeight: Typography.weights.normal,
        lineHeight: 24,
    },
    membersContainer: {
        marginHorizontal: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    membersTitle: {
        fontSize: Typography.sizes.base, // 16px
        fontWeight: Typography.weights.semibold,
        marginBottom: Spacing.md,
    },
    membersRow: {
        alignItems: 'flex-start',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        paddingBottom: Spacing.lg,
        borderTopWidth: 1,
    },
    ctaButtonWrapper: {
        borderRadius: BorderRadius.pill,
        overflow: 'hidden',
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: BorderRadius.pill,
    },
    ctaText: {
        color: '#ffffff',
        fontSize: Typography.sizes.base, // 16px
        fontWeight: Typography.weights.semibold,
    },
});

