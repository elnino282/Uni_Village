import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import type { ItineraryShareData, ItineraryShareStop } from '../types/itinerary.types';

interface ItineraryShareCardProps {
    itinerary: ItineraryShareData;
    onViewDetails: () => void;
    onOpenItinerary: () => void;
    onMessage?: () => void;
}

function TimelineStop({ stop, isLast }: { stop: ItineraryShareStop; isLast: boolean }) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];

    return (
        <View style={styles.stopContainer}>
            <View style={styles.timelineColumn}>
                <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
                {!isLast && <View style={[styles.line, { backgroundColor: colors.borderLight }]} />}
            </View>
            <View style={styles.stopContent}>
                <Text style={[styles.stopTime, { color: colors.textSecondary }]}>{stop.time}</Text>
                <Text style={[styles.stopName, { color: colors.textPrimary }]}>{stop.name}</Text>
                <Text style={[styles.stopAddress, { color: colors.textSecondary }]}>{stop.address}</Text>
                {stop.note && (
                    <Text style={[styles.stopNote, { color: colors.textSecondary }]}>{stop.note}</Text>
                )}
            </View>
        </View>
    );
}

export function ItineraryShareCard({
    itinerary,
    onViewDetails,
    onOpenItinerary,
    onMessage,
}: ItineraryShareCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];

    const visibleStops = itinerary.stops.slice(0, 2);
    const remainingCount = itinerary.stops.length - 2;

    return (
        <View testID="itinerary-share-card" style={styles.wrapper}>
            <View style={[styles.container, { backgroundColor: colors.muted, borderColor: colors.borderLight }]}>
                <View style={styles.header}>
                    <Ionicons name="calendar-outline" size={18} color={colors.actionBlue} />
                    <Text style={[styles.headerText, { color: colors.textPrimary }]}>
                        {itinerary.dayLabel} · {itinerary.date} · {itinerary.stopsCount} điểm
                    </Text>
                </View>

                <View style={styles.timeline}>
                    {visibleStops.map((stop, index) => (
                        <TimelineStop
                            key={stop.id}
                            stop={stop}
                            isLast={index === visibleStops.length - 1}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    testID="view-details"
                    style={styles.viewDetails}
                    onPress={onViewDetails}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.viewDetailsText, { color: colors.actionBlue }]}>
                        Xem chi tiết {remainingCount > 0 ? `(+${remainingCount})` : ''}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={colors.actionBlue} />
                </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    testID="open-itinerary"
                    style={[styles.primaryButton, { backgroundColor: colors.actionBlue }]}
                    onPress={onOpenItinerary}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>Mở lịch trình</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.secondaryButton, { backgroundColor: colors.muted, borderColor: colors.borderLight }]}
                    onPress={onMessage}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Nhắn tin</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: Spacing.cardPadding,
        paddingTop: Spacing.md,
    },
    container: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        padding: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.md,
    },
    headerText: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    timeline: {
        gap: 4,
    },
    stopContainer: {
        flexDirection: 'row',
        minHeight: 70,
    },
    timelineColumn: {
        width: 20,
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 4,
    },
    line: {
        width: 2,
        flex: 1,
        marginTop: 4,
    },
    stopContent: {
        flex: 1,
        paddingLeft: Spacing.sm,
    },
    stopTime: {
        fontSize: Typography.sizes.sm,
        marginBottom: 2,
    },
    stopName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        marginBottom: 2,
    },
    stopAddress: {
        fontSize: Typography.sizes.sm,
    },
    stopNote: {
        fontSize: Typography.sizes.sm,
        fontStyle: 'italic',
        marginTop: 2,
    },
    viewDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
    },
    viewDetailsText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    primaryButton: {
        flex: 1,
        height: 44,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    secondaryButton: {
        flex: 1,
        height: 44,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.medium,
    },
});
