import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Spacing } from '@/shared/constants/spacing';
import { BorderRadius, Colors, MapColors, Shadows } from '@/shared/constants/theme';
import { Typography } from '@/shared/constants/typography';
import React, { memo } from 'react';
import {
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onMicPress?: () => void;
    onProfilePress?: () => void;
    placeholder?: string;
    colorScheme?: 'light' | 'dark';
}

export const SearchBar = memo(function SearchBar({
    value,
    onChangeText,
    onFocus,
    onBlur,
    onMicPress,
    onProfilePress,
    placeholder = 'Tìm kiếm ở đây',
    colorScheme = 'light',
}: SearchBarProps) {
    const colors = Colors[colorScheme];
    const mapColors = MapColors[colorScheme];

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: mapColors.searchBarBackground },
            ]}
        >
            {/* Location Pin Icon */}
            <View style={styles.locationIconContainer}>
                <MaterialIcons
                    name="location-on"
                    size={22}
                    color={colors.tint}
                />
            </View>

            {/* Search Input */}
            <TextInput
                style={[
                    styles.input,
                    { color: colors.text },
                ]}
                value={value}
                onChangeText={onChangeText}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                placeholderTextColor={colors.icon}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                {/* Microphone Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onMicPress}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialIcons
                        name="mic"
                        size={22}
                        color={colors.icon}
                    />
                </TouchableOpacity>

                {/* Divider */}
                <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                />

                {/* Profile Button */}
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={onProfilePress}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <View
                        style={[
                            styles.profileAvatar,
                            { backgroundColor: colors.muted },
                        ]}
                    >
                        <MaterialIcons
                            name="person"
                            size={20}
                            color={colors.icon}
                        />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderRadius: BorderRadius.pill,
        paddingHorizontal: Spacing.sm,
        ...Shadows.card,
    },
    locationIconContainer: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.normal as any,
        paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
        marginRight: Spacing.xs,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        width: 1,
        height: 24,
        marginHorizontal: Spacing.xs,
    },
    profileButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
