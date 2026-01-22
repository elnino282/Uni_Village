import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    useDiscoverPublicChannels,
    useJoinByInviteCode,
    type ChannelCategory,
    type DiscoverChannelsParams,
} from '@/features/chat/hooks/useChannels';
import { EmptyState, LoadingScreen } from '@/shared/components/feedback';
import { Spinner } from '@/shared/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import type { ChannelResponse } from '@/shared/types/backend.types';

const CATEGORY_FILTERS: { key: ChannelCategory | 'ALL'; label: string; emoji: string }[] = [
    { key: 'ALL', label: 'Tất cả', emoji: '🌍' },
    { key: 'TRAVEL', label: 'Du lịch', emoji: '✈️' },
    { key: 'COURSE', label: 'Khóa học', emoji: '📚' },
    { key: 'FOOD', label: 'Ẩm thực', emoji: '🍜' },
    { key: 'PHOTOGRAPHY', label: 'Nhiếp ảnh', emoji: '📷' },
    { key: 'READING', label: 'Đọc sách', emoji: '📖' },
    { key: 'OTHER', label: 'Khác', emoji: '💬' },
];

interface DiscoverChannelsScreenProps {
    onClose?: () => void;
}

export function DiscoverChannelsScreen({ onClose }: DiscoverChannelsScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | 'ALL'>('ALL');
    const [joiningChannelId, setJoiningChannelId] = useState<number | null>(null);

    const params: DiscoverChannelsParams = {
        search: searchQuery || undefined,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        page: 0,
        size: 20,
    };

    const {
        data: channels,
        isLoading,
        isFetching,
        refetch,
        error,
    } = useDiscoverPublicChannels(params);

    const { mutate: joinByInviteCode, isPending: isJoining } = useJoinByInviteCode();

    const handleBack = useCallback(() => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    }, [onClose, router]);

    const handleChannelPress = useCallback((channel: ChannelResponse) => {
        // Navigate to channel info/preview
        if (channel.conversationId) {
            router.push(`/channel/${channel.conversationId}`);
        }
    }, [router]);

    const handleJoinChannel = useCallback((channel: ChannelResponse) => {
        if (!channel.inviteCode || isJoining || !channel.id) return;

        setJoiningChannelId(channel.id);
        joinByInviteCode(channel.inviteCode, {
            onSuccess: () => {
                setJoiningChannelId(null);
                // Navigate to the channel after joining
                if (channel.conversationId) {
                    router.push(`/channel/${channel.conversationId}`);
                }
            },
            onError: () => {
                setJoiningChannelId(null);
            },
        });
    }, [joinByInviteCode, isJoining, router]);

    const renderCategoryChip = ({ item }: { item: typeof CATEGORY_FILTERS[0] }) => {
        const isActive = selectedCategory === item.key;
        return (
            <TouchableOpacity
                style={[
                    styles.categoryChip,
                    isActive
                        ? { backgroundColor: colors.actionBlue }
                        : { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={() => setSelectedCategory(item.key)}
                activeOpacity={0.7}
            >
                <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                <Text
                    style={[
                        styles.categoryLabel,
                        { color: isActive ? '#FFFFFF' : colors.textPrimary },
                    ]}
                >
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderChannelItem = ({ item }: { item: ChannelResponse }) => {
        const isJoiningThis = joiningChannelId === item.id;
        const categoryInfo = CATEGORY_FILTERS.find((c) => c.key === item.category);

        return (
            <TouchableOpacity
                style={[styles.channelCard, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => handleChannelPress(item)}
                activeOpacity={0.8}
            >
                {/* Channel Avatar */}
                <View style={styles.channelAvatar}>
                    {item.avatarUrl ? (
                        <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
                    ) : (
                        <View
                            style={[
                                styles.avatarPlaceholder,
                                { backgroundColor: colors.actionBlue + '20' },
                            ]}
                        >
                            <Text style={styles.avatarEmoji}>
                                {categoryInfo?.emoji || '👥'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Channel Info */}
                <View style={styles.channelInfo}>
                    <View style={styles.channelHeader}>
                        <Text
                            style={[styles.channelName, { color: colors.textPrimary }]}
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>
                        {categoryInfo && (
                            <View
                                style={[
                                    styles.categoryBadge,
                                    { backgroundColor: colors.actionBlue + '15' },
                                ]}
                            >
                                <Text style={styles.categoryBadgeText}>
                                    {categoryInfo.emoji} {categoryInfo.label}
                                </Text>
                            </View>
                        )}
                    </View>

                    {item.description && (
                        <Text
                            style={[styles.channelDescription, { color: colors.textSecondary }]}
                            numberOfLines={2}
                        >
                            {item.description}
                        </Text>
                    )}

                    <View style={styles.channelMeta}>
                        <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
                            {item.memberCount ?? 0} thành viên
                        </Text>
                    </View>
                </View>

                {/* Join Button */}
                <TouchableOpacity
                    style={[styles.joinButton, { backgroundColor: colors.actionBlue }]}
                    onPress={() => handleJoinChannel(item)}
                    disabled={isJoiningThis || isJoining}
                    activeOpacity={0.7}
                >
                    {isJoiningThis ? (
                        <Spinner size="sm" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.joinButtonText}>Tham gia</Text>
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return <LoadingScreen message="Đang tải channels..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    Khám phá Channels
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                <TextInput
                    style={[styles.searchInput, { color: colors.textPrimary }]}
                    placeholder="Tìm kiếm channels..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Category Filters */}
            <FlatList
                data={CATEGORY_FILTERS}
                renderItem={renderCategoryChip}
                keyExtractor={(item) => item.key}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
                style={styles.categoryContainer}
            />

            {/* Channel List */}
            {error ? (
                <View style={styles.errorContainer}>
                    <EmptyState
                        icon="❌"
                        title="Đã xảy ra lỗi"
                        message="Không thể tải danh sách channels. Vui lòng thử lại."
                        actionLabel="Thử lại"
                        onAction={() => refetch()}
                    />
                </View>
            ) : (
                <FlatList
                    data={channels ?? []}
                    renderItem={renderChannelItem}
                    keyExtractor={(item) => (item.id ?? '0').toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isFetching && !isLoading}
                            onRefresh={refetch}
                            tintColor={colors.actionBlue}
                        />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon="🔍"
                            title={searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có channel công khai'}
                            message={
                                searchQuery
                                    ? 'Thử tìm kiếm với từ khóa khác'
                                    : 'Hãy tạo channel mới để bắt đầu cộng đồng của bạn!'
                            }
                        />
                    }
                />
            )}
        </View>
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
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    headerSpacer: {
        width: 32,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.md,
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: Typography.sizes.md,
        paddingVertical: 0,
    },
    categoryContainer: {
        maxHeight: 50,
    },
    categoryList: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginRight: Spacing.sm,
        gap: 4,
    },
    categoryEmoji: {
        fontSize: 14,
    },
    categoryLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    listContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        paddingBottom: 100,
    },
    channelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    channelAvatar: {
        marginRight: Spacing.md,
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.lg,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEmoji: {
        fontSize: 24,
    },
    channelInfo: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    channelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginBottom: 4,
    },
    channelName: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: Typography.weights.medium,
    },
    channelDescription: {
        fontSize: Typography.sizes.sm,
        lineHeight: 18,
        marginBottom: 4,
    },
    channelMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    memberCount: {
        fontSize: Typography.sizes.xs,
    },
    joinButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        minWidth: 80,
        alignItems: 'center',
    },
    joinButtonText: {
        color: '#FFFFFF',
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
