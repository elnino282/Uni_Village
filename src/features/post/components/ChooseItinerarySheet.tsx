/**
 * ChooseItinerarySheet Component
 * Bottom sheet for selecting an Itinerary when creating a post
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
    ItineraryForSelection,
    MOCK_MY_ITINERARIES,
    MOCK_SAVED_ITINERARIES,
} from '../types/createPost.types';
import { SegmentedTabs, TabItem } from './SegmentedTabs';

type ItinerarySubTab = 'mine' | 'saved';

const ITINERARY_TABS: TabItem<ItinerarySubTab>[] = [
    { key: 'mine', label: 'Của tôi' },
    { key: 'saved', label: 'Đã lưu' },
];

export interface ChooseItinerarySheetProps {
    onSelect: (itinerary: ItineraryForSelection) => void;
}

export const ChooseItinerarySheet = forwardRef<BottomSheet, ChooseItinerarySheetProps>(
    ({ onSelect }, ref) => {
        const colorScheme = useColorScheme() ?? 'light';
        const colors = Colors[colorScheme];

        const [activeTab, setActiveTab] = useState<ItinerarySubTab>('mine');
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

        const itineraries = activeTab === 'mine' ? MOCK_MY_ITINERARIES : MOCK_SAVED_ITINERARIES;

        const filteredItineraries = useMemo(() => {
            if (!searchQuery.trim()) return itineraries;
            const query = searchQuery.toLowerCase();
            return itineraries.filter(
                (it) =>
                    it.title.toLowerCase().includes(query) ||
                    it.area.toLowerCase().includes(query)
            );
        }, [itineraries, searchQuery]);

        const handleSelect = (itinerary: ItineraryForSelection) => {
            onSelect(itinerary);
        };

        const renderItineraryItem = useCallback(
            ({ item }: { item: ItineraryForSelection }) => (
                <TouchableOpacity
                    style={[
                        styles.itineraryCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                        },
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                >
                    {/* Tags */}
                    <View style={styles.tagsRow}>
                        {item.tags.map((tag, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.tag,
                                    { backgroundColor: colors.chipBackground },
                                ]}
                            >
                                <Text
                                    style={[styles.tagText, { color: colors.textSecondary }]}
                                >
                                    {tag}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Title */}
                    <Text
                        style={[styles.itineraryTitle, { color: colors.textPrimary }]}
                        numberOfLines={2}
                    >
                        {item.title}
                    </Text>

                    {/* Meta */}
                    <View style={styles.metaRow}>
                        <MaterialIcons
                            name="event"
                            size={14}
                            color={colors.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {item.date}
                        </Text>
                        <Text style={[styles.metaDot, { color: colors.textSecondary }]}>
                            •
                        </Text>
                        <MaterialIcons
                            name="schedule"
                            size={14}
                            color={colors.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {item.timeRange}
                        </Text>
                    </View>

                    <View style={styles.metaRow}>
                        <MaterialIcons
                            name="place"
                            size={14}
                            color={colors.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {item.area}
                        </Text>
                        <Text style={[styles.metaDot, { color: colors.textSecondary }]}>
                            •
                        </Text>
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {item.stopsCount} điểm dừng
                        </Text>
                    </View>
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
                        Chọn lịch trình
                    </Text>
                </View>

                {/* Inner Tabs */}
                <View style={styles.tabsContainer}>
                    <SegmentedTabs
                        tabs={ITINERARY_TABS}
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
                            placeholder="Tìm lịch trình…"
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Itinerary List */}
                <BottomSheetFlatList<ItineraryForSelection>
                    data={filteredItineraries}
                    keyExtractor={(item: ItineraryForSelection) => item.id}
                    renderItem={renderItineraryItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                Không tìm thấy lịch trình
                            </Text>
                        </View>
                    }
                />
            </BottomSheet>
        );
    }
);

ChooseItinerarySheet.displayName = 'ChooseItinerarySheet';

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
        paddingHorizontal: Spacing.screenPadding,
        paddingBottom: Spacing.xl,
        gap: Spacing.sm,
    },
    itineraryCard: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    tag: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    tagText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    itineraryTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        marginBottom: Spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    metaText: {
        fontSize: Typography.sizes.sm,
    },
    metaDot: {
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
