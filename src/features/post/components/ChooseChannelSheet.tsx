/**
 * ChooseChannelSheet Component
 * Bottom sheet for selecting a Channel when creating a post
 */

import { BorderRadius, Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
    ChannelForSelection,
    MOCK_JOINED_CHANNELS,
    MOCK_MY_CHANNELS,
} from '../types/createPost.types';
import { SegmentedTabs, TabItem } from './SegmentedTabs';

type ChannelSubTab = 'mine' | 'joined';

const CHANNEL_TABS: TabItem<ChannelSubTab>[] = [
    { key: 'mine', label: 'Của tôi' },
    { key: 'joined', label: 'Đã tham gia' },
];

export interface ChooseChannelSheetProps {
    onSelect: (channel: ChannelForSelection) => void;
}

export const ChooseChannelSheet = forwardRef<BottomSheet, ChooseChannelSheetProps>(
    ({ onSelect }, ref) => {
        const colorScheme = useColorScheme() ?? 'light';
        const colors = Colors[colorScheme];

        const [activeTab, setActiveTab] = useState<ChannelSubTab>('mine');
        const [searchQuery, setSearchQuery] = useState('');

        const snapPoints = useMemo(() => ['70%', '90%'], []);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                />
            ),
            []
        );

        const channels = activeTab === 'mine' ? MOCK_MY_CHANNELS : MOCK_JOINED_CHANNELS;

        const filteredChannels = useMemo(() => {
            if (!searchQuery.trim()) return channels;
            const query = searchQuery.toLowerCase();
            return channels.filter(
                (c) =>
                    c.name.toLowerCase().includes(query) ||
                    c.description.toLowerCase().includes(query)
            );
        }, [channels, searchQuery]);

        const handleSelect = (channel: ChannelForSelection) => {
            onSelect(channel);
            // Sheet will be closed by parent
        };

        const renderChannelItem = useCallback(
            ({ item }: { item: ChannelForSelection }) => (
                <TouchableOpacity
                    style={[
                        styles.channelItem,
                        { borderBottomColor: colors.border },
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.channelLeft}>
                        <View
                            style={[
                                styles.channelIcon,
                                { backgroundColor: colors.chipBackground },
                            ]}
                        >
                            <Text style={styles.channelEmoji}>
                                {item.emoji || '#'}
                            </Text>
                        </View>
                        <View style={styles.channelInfo}>
                            <Text
                                style={[styles.channelName, { color: colors.textPrimary }]}
                                numberOfLines={1}
                            >
                                {item.name}
                            </Text>
                            <Text
                                style={[styles.channelMeta, { color: colors.textSecondary }]}
                                numberOfLines={1}
                            >
                                {item.memberCount.toLocaleString()} thành viên · {item.lastActive}
                            </Text>
                        </View>
                    </View>
                    <MaterialIcons
                        name="chevron-right"
                        size={24}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>
            ),
            [colors, handleSelect]
        );

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={[styles.background, { backgroundColor: colors.background }]}
                handleIndicatorStyle={[styles.indicator, { backgroundColor: colors.border }]}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Chọn Channel
                    </Text>
                </View>

                {/* Inner Tabs */}
                <View style={styles.tabsContainer}>
                    <SegmentedTabs
                        tabs={CHANNEL_TABS}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View
                        style={[
                            styles.searchInputContainer,
                            {
                                backgroundColor: colors.chipBackground,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <MaterialIcons
                            name="search"
                            size={20}
                            color={colors.textSecondary}
                        />
                        <BottomSheetTextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Tìm Channel…"
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Channel List */}
                <BottomSheetFlatList<ChannelForSelection>
                    data={filteredChannels}
                    keyExtractor={(item: ChannelForSelection) => item.id}
                    renderItem={renderChannelItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                Không tìm thấy Channel
                            </Text>
                        </View>
                    }
                />
            </BottomSheet>
        );
    }
);

ChooseChannelSheet.displayName = 'ChooseChannelSheet';

const styles = StyleSheet.create({
    background: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
    },
    indicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        textAlign: 'center',
    },
    tabsContainer: {
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.sm,
    },
    searchContainer: {
        paddingHorizontal: Spacing.screenPadding,
        paddingBottom: Spacing.sm,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: Typography.sizes.base,
        paddingVertical: 0,
    },
    listContent: {
        paddingBottom: Spacing.xl,
    },
    channelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.sm + 4,
        borderBottomWidth: 1,
    },
    channelLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.sm + 4,
    },
    channelIcon: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    channelEmoji: {
        fontSize: 20,
    },
    channelInfo: {
        flex: 1,
    },
    channelName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        marginBottom: 2,
    },
    channelMeta: {
        fontSize: Typography.sizes.sm,
    },
    emptyContainer: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: Typography.sizes.base,
    },
});
