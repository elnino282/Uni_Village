import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Spacing } from '@/shared/constants/spacing';
import { BorderRadius, Colors, MapColors, Shadows } from '@/shared/constants/theme';
import { Typography } from '@/shared/constants/typography';
import React, { memo } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { Place } from '../types';

interface SuggestionCardProps {
    place: Place | null;
    onPlacePress?: (place: Place) => void;
    onExpand?: () => void;
    colorScheme?: 'light' | 'dark';
}

export const SuggestionCard = memo(function SuggestionCard({
    place,
    onPlacePress,
    onExpand,
    colorScheme = 'light',
}: SuggestionCardProps) {
    const colors = Colors[colorScheme];
    const mapColors = MapColors[colorScheme];

    if (!place) {
        return null;
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: mapColors.suggestionCardBackground },
            ]}
        >
            {/* Drag Handle */}
            <TouchableOpacity
                style={styles.handleContainer}
                onPress={onExpand}
                activeOpacity={0.7}
            >
                <View
                    style={[styles.handle, { backgroundColor: colors.border }]}
                />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Địa điểm gợi ý gần bạn
                </Text>
                <TouchableOpacity
                    onPress={onExpand}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialIcons
                        name="keyboard-arrow-up"
                        size={24}
                        color={colors.icon}
                    />
                </TouchableOpacity>
            </View>

            {/* Place Card */}
            <TouchableOpacity
                style={styles.placeCard}
                onPress={() => onPlacePress?.(place)}
                activeOpacity={0.7}
            >
                {/* Thumbnail */}
                <Image
                    source={{ uri: place.thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />

                {/* Info */}
                <View style={styles.placeInfo}>
                    {/* Name & Category */}
                    <View style={styles.nameRow}>
                        <Text
                            style={[styles.placeName, { color: colors.text }]}
                            numberOfLines={1}
                        >
                            {place.name}
                        </Text>
                    </View>

                    {/* Rating & Distance */}
                    <View style={styles.metaRow}>
                        <View style={styles.ratingContainer}>
                            <MaterialIcons
                                name="star"
                                size={14}
                                color="#f59e0b"
                            />
                            <Text style={[styles.rating, { color: colors.text }]}>
                                {place.rating.toFixed(1)}
                            </Text>
                            {place.ratingCount && (
                                <Text style={[styles.ratingCount, { color: colors.icon }]}>
                                    ({place.ratingCount})
                                </Text>
                            )}
                        </View>
                        <View style={styles.distanceContainer}>
                            <MaterialIcons
                                name="directions-walk"
                                size={14}
                                color={colors.icon}
                            />
                            <Text style={[styles.distance, { color: colors.icon }]}>
                                {place.distanceKm < 1
                                    ? `${(place.distanceKm * 1000).toFixed(0)}m`
                                    : `${place.distanceKm.toFixed(1)}km`}
                            </Text>
                        </View>
                    </View>

                    {/* Tags */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.tagsContainer}
                        contentContainerStyle={styles.tagsContent}
                    >
                        {place.tags.map((tag, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.tag,
                                    { backgroundColor: colors.muted },
                                ]}
                            >
                                <Text style={[styles.tagText, { color: colors.icon }]}>
                                    {tag}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                    <MaterialIcons
                        name="chevron-right"
                        size={24}
                        color={colors.icon}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingBottom: Spacing.lg, 
        ...Shadows.lg,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPadding,
        paddingBottom: Spacing.sm,
    },
    headerTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold as any,
    },
    placeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.sm,
    },
    thumbnail: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.lg,
        backgroundColor: '#e5e5e5',
    },
    placeInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    placeName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold as any,
        flex: 1,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    rating: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium as any,
        marginLeft: 2,
    },
    ratingCount: {
        fontSize: Typography.sizes.xs,
        marginLeft: 2,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distance: {
        fontSize: Typography.sizes.sm,
        marginLeft: 2,
    },
    tagsContainer: {
        flexGrow: 0,
    },
    tagsContent: {
        gap: Spacing.xs,
    },
    tag: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        marginRight: Spacing.xs,
    },
    tagText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.medium as any,
    },
    arrowContainer: {
        paddingLeft: Spacing.sm,
    },
});
