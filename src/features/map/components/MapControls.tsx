import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Spacing } from '@/shared/constants/spacing';
import { BorderRadius, Colors, MapColors, Shadows } from '@/shared/constants/theme';
import React, { memo } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface MapControlsProps {
    onLayersPress?: () => void;
    onMyLocationPress?: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    isLoadingLocation?: boolean;
    colorScheme?: 'light' | 'dark';
}

export const MapControls = memo(function MapControls({
    onLayersPress,
    onMyLocationPress,
    onZoomIn,
    onZoomOut,
    isLoadingLocation = false,
    colorScheme = 'light',
}: MapControlsProps) {
    const colors = Colors[colorScheme];
    const mapColors = MapColors[colorScheme];

    return (
        <View style={styles.container}>
            {/* Layers Button */}
            <TouchableOpacity
                style={[
                    styles.controlButton,
                    { backgroundColor: mapColors.controlBackground },
                ]}
                onPress={onLayersPress}
                activeOpacity={0.7}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
                <MaterialIcons
                    name="layers"
                    size={24}
                    color={colors.icon}
                />
            </TouchableOpacity>

            {/* Zoom In Button */}
            {onZoomIn && (
                <TouchableOpacity
                    style={[
                        styles.controlButton,
                        { backgroundColor: mapColors.controlBackground },
                    ]}
                    onPress={onZoomIn}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="add" size={24} color={colors.icon} />
                </TouchableOpacity>
            )}

            {/* Zoom Out Button */}
            {onZoomOut && (
                <TouchableOpacity
                    style={[
                        styles.controlButton,
                        { backgroundColor: mapColors.controlBackground },
                    ]}
                    onPress={onZoomOut}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="remove" size={24} color={colors.icon} />
                </TouchableOpacity>
            )}

            {/* My Location Button */}
            <TouchableOpacity
                style={[
                    styles.controlButton,
                    { backgroundColor: mapColors.controlBackground },
                ]}
                onPress={onMyLocationPress}
                activeOpacity={0.7}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                disabled={isLoadingLocation}
            >
                {isLoadingLocation ? (
                    <ActivityIndicator size="small" color={colors.tint} />
                ) : (
                    <MaterialIcons
                        name="my-location"
                        size={24}
                        color={colors.tint}
                    />
                )}
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: Spacing.screenPadding,
        bottom: 220,
        gap: Spacing.sm,
    },
    controlButton: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.card,
    },
});
