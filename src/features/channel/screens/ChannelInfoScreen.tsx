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
import { LoadingScreen } from '@/shared/components/feedback';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import { useChannelInfo, useJoinChannel } from '../hooks';

/**
 * Group/Channel Info screen matching Figma NODE 321-5121
 */
export function ChannelInfoScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const router = useRouter();
    const { channelId } = useLocalSearchParams<{ channelId: string }>();

    const { data: channelInfo, isLoading } = useChannelInfo(channelId || '');
    const joinChannelMutation = useJoinChannel();

    const handleBack = () => {
        router.back();
    };

    const handleJoinChat = () => {
        if (!channelInfo) return;

        if (channelInfo.isJoined) {
            // Navigate to channel thread
            router.push({
                pathname: '/channel/[channelId]',
                params: { channelId: channelInfo.id },
            } as any);
        } else {
            // Join then navigate
            joinChannelMutation.mutate(channelInfo.id, {
                onSuccess: () => {
                    router.push({
                        pathname: '/channel/[channelId]',
                        params: { channelId: channelInfo.id },
                    } as any);
                },
            });
        }
    };

    const handleCreatorPress = () => {
        // Navigate to creator profile (stub)
        console.log('Navigate to creator profile:', channelInfo?.creator.id);
    };

    if (isLoading || !channelInfo) {
        return <LoadingScreen message="Đang tải thông tin nhóm..." />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.actionBlue }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông tin nhóm</Text>
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
                        Tạo bởi{' '}
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
                        Thành viên ({channelInfo.memberCount.toLocaleString()})
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
                                ? 'Đang xử lý...'
                                : channelInfo.isJoined
                                    ? 'Vào chat'
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
