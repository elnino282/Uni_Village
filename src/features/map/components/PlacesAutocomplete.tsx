/**
 * Places Autocomplete Component
 * 
 * Shows a dropdown of place suggestions as the user types.
 * Uses Google Places API (New) for autocomplete.
 */

import { Spacing } from '@/shared/constants/spacing';
import { BorderRadius, Colors, Shadows } from '@/shared/constants/theme';
import { Typography } from '@/shared/constants/typography';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    autocomplete,
    getPlaceDetails,
    PlaceDetails,
    PlacePrediction,
} from '../services/placesService';

interface PlacesAutocompleteProps {
    /** Search query string */
    query: string;
    /** Whether the autocomplete dropdown is visible */
    isVisible: boolean;
    /** Callback when a place is selected */
    onPlaceSelect: (place: PlaceDetails) => void;
    /** Callback to close the autocomplete */
    onClose: () => void;
    /** User's current location for biasing results */
    userLocation?: { latitude: number; longitude: number };
    /** Color scheme */
    colorScheme?: 'light' | 'dark';
    /** Custom placeholder for empty state */
    emptyPlaceholder?: string;
}

export const PlacesAutocomplete = memo(function PlacesAutocomplete({
    query,
    isVisible,
    onPlaceSelect,
    onClose,
    userLocation,
    colorScheme = 'light',
    emptyPlaceholder = 'Nhập tối thiểu 2 ký tự để tìm kiếm',
}: PlacesAutocompleteProps) {
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const colors = Colors[colorScheme];

    // Debounced autocomplete search
    useEffect(() => {
        if (!isVisible) {
            setPredictions([]);
            return;
        }

        if (debounceRef.current !== null) {
            clearTimeout(debounceRef.current);
        }

        if (query.length < 2) {
            setPredictions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        debounceRef.current = setTimeout(async () => {
            try {
                const results = await autocomplete(query, {
                    location: userLocation,
                    countries: ['vn'],
                    limit: 5,
                });
                setPredictions(results);
            } catch (error) {
                console.error('Autocomplete error:', error);
                setPredictions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, isVisible, userLocation]);

    const handleSelectPrediction = useCallback(
        async (prediction: PlacePrediction) => {
            Keyboard.dismiss();
            setIsLoadingDetails(true);

            try {
                const details = await getPlaceDetails(prediction.placeId);
                if (details) {
                    onPlaceSelect(details);
                    onClose();
                }
            } catch (error) {
                console.error('Get place details error:', error);
            } finally {
                setIsLoadingDetails(false);
            }
        },
        [onPlaceSelect, onClose]
    );

    const renderPredictionItem = useCallback(
        ({ item }: { item: PlacePrediction }) => (
            <TouchableOpacity
                style={[styles.predictionItem, { borderBottomColor: colors.border }]}
                onPress={() => handleSelectPrediction(item)}
                activeOpacity={0.7}
            >
                <View style={styles.predictionIcon}>
                    <MaterialIcons
                        name="location-on"
                        size={20}
                        color={colors.tint}
                    />
                </View>
                <View style={styles.predictionContent}>
                    <Text
                        style={[styles.predictionMainText, { color: colors.text }]}
                        numberOfLines={1}
                    >
                        {item.mainText}
                    </Text>
                    <Text
                        style={[styles.predictionSecondaryText, { color: colors.icon }]}
                        numberOfLines={1}
                    >
                        {item.secondaryText}
                    </Text>
                </View>
                <MaterialIcons
                    name="north-west"
                    size={16}
                    color={colors.icon}
                />
            </TouchableOpacity>
        ),
        [colors, handleSelectPrediction]
    );

    const keyExtractor = useCallback(
        (item: PlacePrediction) => item.placeId,
        []
    );

    if (!isVisible) {
        return null;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            {/* Loading overlay for getting place details */}
            {isLoadingDetails && (
                <View style={[styles.loadingOverlay, { backgroundColor: colors.card }]}>
                    <ActivityIndicator size="small" color={colors.tint} />
                    <Text style={[styles.loadingText, { color: colors.text }]}>
                        Đang tải chi tiết...
                    </Text>
                </View>
            )}

            {/* Search loading indicator */}
            {isLoading && (
                <View style={styles.searchingRow}>
                    <ActivityIndicator size="small" color={colors.icon} />
                    <Text style={[styles.searchingText, { color: colors.icon }]}>
                        Đang tìm kiếm...
                    </Text>
                </View>
            )}

            {/* No results or waiting for input */}
            {!isLoading && predictions.length === 0 && (
                <View style={styles.emptyState}>
                    <MaterialIcons
                        name="search"
                        size={24}
                        color={colors.icon}
                    />
                    <Text style={[styles.emptyText, { color: colors.icon }]}>
                        {query.length < 2 ? emptyPlaceholder : 'Không tìm thấy kết quả'}
                    </Text>
                </View>
            )}

            {/* Predictions list */}
            {!isLoading && predictions.length > 0 && (
                <FlatList
                    data={predictions}
                    renderItem={renderPredictionItem}
                    keyExtractor={keyExtractor}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Powered by Google */}
            <View style={[styles.poweredBy, { borderTopColor: colors.border }]}>
                <Text style={[styles.poweredByText, { color: colors.icon }]}>
                    Powered by Google
                </Text>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: Spacing.xs,
        borderRadius: BorderRadius.lg,
        maxHeight: 300,
        ...Shadows.card,
        overflow: 'hidden',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    loadingText: {
        fontSize: Typography.sizes.sm,
    },
    searchingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    searchingText: {
        fontSize: Typography.sizes.sm,
    },
    emptyState: {
        padding: Spacing.lg,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    emptyText: {
        fontSize: Typography.sizes.sm,
        textAlign: 'center',
    },
    listContent: {
        paddingVertical: Spacing.xs,
    },
    predictionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    predictionIcon: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    predictionContent: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    predictionMainText: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.medium as any,
        marginBottom: 2,
    },
    predictionSecondaryText: {
        fontSize: Typography.sizes.sm,
    },
    poweredBy: {
        padding: Spacing.sm,
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    poweredByText: {
        fontSize: Typography.sizes.xs,
    },
});
