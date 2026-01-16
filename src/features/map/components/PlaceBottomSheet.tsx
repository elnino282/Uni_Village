/**
 * PlaceBottomSheet - Gorhom Bottom Sheet for Place Details
 *
 * Features:
 * - 3 snap points (collapsed, half, full)
 * - 60fps gesture-driven animations
 * - Place details with actions
 * - Recently viewed list
 * - Safe area handling
 */

import { Spacing } from "@/shared/constants/spacing";
import { BorderRadius, Colors, MapColors, Shadows } from "@/shared/constants/theme";
import { Typography } from "@/shared/constants/typography";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetScrollView
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, {
    forwardRef,
    memo,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Place } from "../types";
import { PhotoCarousel } from "./PhotoCarousel";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface PlaceBottomSheetProps {
    /** Currently selected place */
    place: Place | null;
    /** List of recently viewed places */
    recentlyViewed?: Place[];
    /** Callback when a place is selected */
    onPlaceSelect?: (place: Place) => void;
    /** Callback when directions button is pressed */
    onDirections?: (place: Place) => void;
    /** Callback when view details is pressed */
    onViewDetails?: (place: Place) => void;
    /** Callback when sheet is closed */
    onClose?: () => void;
    /** Callback when sheet index changes */
    onSheetChange?: (index: number) => void;
    /** Color scheme */
    colorScheme?: "light" | "dark";
}

export interface PlaceBottomSheetRef {
    /** Expand sheet to full height */
    expand: () => void;
    /** Collapse sheet to minimum height */
    collapse: () => void;
    /** Close sheet completely */
    close: () => void;
    /** Snap to specific index */
    snapToIndex: (index: number) => void;
}

/** Memoized Place Card Component */
const PlaceCard = memo(function PlaceCard({
    place,
    onPress,
    onDirections,
    colorScheme = "light",
    compact = false,
}: {
    place: Place;
    onPress?: () => void;
    onDirections?: () => void;
    colorScheme?: "light" | "dark";
    compact?: boolean;
}) {
    const colors = Colors[colorScheme];

    return (
        <TouchableOpacity
            style={[styles.placeCard, compact && styles.placeCardCompact]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Thumbnail */}
            <Image
                source={{ uri: place.thumbnail }}
                style={[styles.thumbnail, compact && styles.thumbnailCompact]}
                resizeMode="cover"
            />

            {/* Info */}
            <View style={styles.placeInfo}>
                {/* Name */}
                <Text
                    style={[styles.placeName, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {place.name}
                </Text>

                {/* Meta Row */}
                <View style={styles.metaRow}>
                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                        <MaterialIcons name="star" size={14} color="#FBBF24" />
                        <Text style={[styles.ratingText, { color: colors.text }]}>
                            {place.rating.toFixed(1)}
                        </Text>
                        {place.ratingCount && (
                            <Text style={[styles.ratingCount, { color: colors.icon }]}>
                                ({place.ratingCount})
                            </Text>
                        )}
                    </View>

                    {/* Distance */}
                    {place.distanceKm > 0 && (
                        <View style={styles.distanceContainer}>
                            <MaterialIcons
                                name="directions-walk"
                                size={14}
                                color={colors.icon}
                            />
                            <Text style={[styles.distanceText, { color: colors.icon }]}>
                                {place.distanceKm < 1
                                    ? `${Math.round(place.distanceKm * 1000)} m`
                                    : `${place.distanceKm.toFixed(1)} km`}
                            </Text>
                        </View>
                    )}

                    {/* Open Status */}
                    {place.isOpen !== undefined && (
                        <View style={styles.statusContainer}>
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: place.isOpen ? "#22C55E" : "#EF4444" },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.statusText,
                                    { color: place.isOpen ? "#22C55E" : "#EF4444" },
                                ]}
                            >
                                {place.isOpen ? "Mở cửa" : "Đóng cửa"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Address */}
                {place.address && !compact && (
                    <Text
                        style={[styles.addressText, { color: colors.icon }]}
                        numberOfLines={1}
                    >
                        {place.address}
                    </Text>
                )}
            </View>

            {/* Direction Button (for main place only) */}
            {onDirections && !compact && (
                <TouchableOpacity
                    style={[styles.directionsButton, { backgroundColor: colors.tint }]}
                    onPress={onDirections}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="directions" size={20} color="#fff" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
});

/** Recently Viewed Section */
const RecentlyViewedSection = memo(function RecentlyViewedSection({
    places,
    onPlaceSelect,
    colorScheme = "light",
}: {
    places: Place[];
    onPlaceSelect?: (place: Place) => void;
    colorScheme?: "light" | "dark";
}) {
    const colors = Colors[colorScheme];

    if (!places || places.length === 0) {
        return null;
    }

    return (
        <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Đã xem gần đây
            </Text>
            <View style={styles.recentList}>
                {places.slice(0, 5).map((place) => (
                    <TouchableOpacity
                        key={place.id}
                        style={[styles.recentItem, { backgroundColor: colors.muted }]}
                        onPress={() => onPlaceSelect?.(place)}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={{ uri: place.thumbnail }}
                            style={styles.recentThumbnail}
                            resizeMode="cover"
                        />
                        <Text
                            style={[styles.recentName, { color: colors.text }]}
                            numberOfLines={1}
                        >
                            {place.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
});

export const PlaceBottomSheet = forwardRef<
    PlaceBottomSheetRef,
    PlaceBottomSheetProps
>(function PlaceBottomSheet(
    {
        place,
        recentlyViewed = [],
        onPlaceSelect,
        onDirections,
        onViewDetails,
        onClose,
        onSheetChange,
        colorScheme = "light",
    },
    ref
) {
    const router = useRouter();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const insets = useSafeAreaInsets();
    const colors = Colors[colorScheme];
    const mapColors = MapColors[colorScheme];

    // Snap points: collapsed (for header), half screen, full screen
    const snapPoints = useMemo(() => {
        const collapsed = 120;
        const half = SCREEN_HEIGHT * 0.4;
        const full = SCREEN_HEIGHT * 0.85;
        return [collapsed, half, full];
    }, []);

    // Expose methods
    useImperativeHandle(ref, () => ({
        expand: () => bottomSheetRef.current?.expand(),
        collapse: () => bottomSheetRef.current?.snapToIndex(0),
        close: () => bottomSheetRef.current?.close(),
        snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    }));

    // Handle sheet changes
    const handleSheetChange = useCallback(
        (index: number) => {
            onSheetChange?.(index);
            if (index === -1) {
                onClose?.();
            }
        },
        [onSheetChange, onClose]
    );

    // Render backdrop
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={0}
                appearsOnIndex={1}
                opacity={0.5}
            />
        ),
        []
    );

    // Handle place press
    const handlePlacePress = useCallback(() => {
        if (place && onPlaceSelect) {
            onPlaceSelect(place);
        }
    }, [place, onPlaceSelect]);

    // Handle directions press
    const handleDirectionsPress = useCallback(() => {
        if (place && onDirections) {
            onDirections(place);
        }
    }, [place, onDirections]);

    // Handle view details - navigate to PlaceDetailsScreen
    const handleViewDetails = useCallback(() => {
        if (place) {
            if (onViewDetails) {
                onViewDetails(place);
            } else {
                // Default: navigate to PlaceDetailsScreen
                router.push({
                    pathname: "/place-details" as any,
                    params: { placeData: JSON.stringify(place) },
                });
            }
        }
    }, [place, onViewDetails, router]);

    // Don't render if no place
    if (!place && recentlyViewed.length === 0) {
        return null;
    }

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            onChange={handleSheetChange}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={[
                styles.handleIndicator,
                { backgroundColor: mapColors.bottomSheetHandle },
            ]}
            backgroundStyle={[
                styles.sheetBackground,
                { backgroundColor: mapColors.bottomSheetBackground },
            ]}
            enablePanDownToClose={false}
            style={styles.sheet}
        >
            {/* Main Content */}
            <BottomSheetScrollView
                contentContainerStyle={[
                    styles.contentContainer,
                    { paddingBottom: insets.bottom + Spacing.md },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Photo Carousel (Quick View) */}
                {place && place.photos && place.photos.length > 0 && (
                    <PhotoCarousel
                        photos={place.photos}
                        onPhotoPress={handleViewDetails}
                        onViewAllPress={handleViewDetails}
                        colorScheme={colorScheme}
                    />
                )}

                {/* Section Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Địa điểm gợi ý gần bạn
                    </Text>
                </View>

                {/* Selected Place Card */}
                {place && (
                    <PlaceCard
                        place={place}
                        onPress={handleViewDetails}
                        onDirections={handleDirectionsPress}
                        colorScheme={colorScheme}
                    />
                )}

                {/* Action Buttons */}
                {place && (
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.muted }]}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="bookmark-outline" size={18} color={colors.text} />
                            <Text style={[styles.actionText, { color: colors.text }]}>
                                Lưu
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.muted }]}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="share" size={18} color={colors.text} />
                            <Text style={[styles.actionText, { color: colors.text }]}>
                                Chia sẻ
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.directionsActionButton]}
                            onPress={handleDirectionsPress}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="directions" size={18} color="#fff" />
                            <Text style={[styles.actionText, { color: "#fff" }]}>
                                Chỉ đường
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Recently Viewed Section */}
                <RecentlyViewedSection
                    places={recentlyViewed}
                    onPlaceSelect={onPlaceSelect}
                    colorScheme={colorScheme}
                />
            </BottomSheetScrollView>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    sheet: {
        ...Shadows.xl,
    },
    sheetBackground: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
    },
    handleIndicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    contentContainer: {
        paddingHorizontal: Spacing.md,
    },
    header: {
        paddingVertical: Spacing.sm,
    },
    headerTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold as any,
    },
    placeCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.sm,
        gap: Spacing.md,
        backgroundColor: "transparent",
    },
    placeCardCompact: {
        padding: Spacing.xs,
        gap: Spacing.sm,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.lg,
    },
    thumbnailCompact: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.md,
    },
    placeInfo: {
        flex: 1,
        gap: Spacing.xs,
    },
    placeName: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold as any,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        flexWrap: "wrap",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    ratingText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium as any,
    },
    ratingCount: {
        fontSize: Typography.sizes.sm,
    },
    distanceContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    distanceText: {
        fontSize: Typography.sizes.sm,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.medium as any,
    },
    addressText: {
        fontSize: Typography.sizes.sm,
    },
    directionsButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        ...Shadows.md,
    },
    actionsRow: {
        flexDirection: "row",
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
    },
    directionsActionButton: {
        backgroundColor: "#4285F4",
    },
    actionText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium as any,
    },
    recentSection: {
        marginTop: Spacing.md,
        gap: Spacing.sm,
    },
    sectionTitle: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold as any,
    },
    recentList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.sm,
    },
    recentItem: {
        alignItems: "center",
        padding: Spacing.sm,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
        width: 100,
    },
    recentThumbnail: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.md,
    },
    recentName: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.medium as any,
        textAlign: "center",
    },
});
