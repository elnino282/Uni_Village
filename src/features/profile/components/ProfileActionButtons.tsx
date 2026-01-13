/**
 * ProfileActionButtons Component
 * Side-by-side Edit and Share profile buttons with responsive scaling
 */

import { BorderRadius, Colors } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ms, s, vs } from 'react-native-size-matters';

interface ProfileActionButtonsProps {
    onEditPress?: () => void;
    onSharePress?: () => void;
}

export function ProfileActionButtons({
    onEditPress,
    onSharePress,
}: ProfileActionButtonsProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.secondaryButton,
                    { borderColor: colors.tint },
                    pressed && styles.pressed,
                ]}
                onPress={onEditPress}
            >
                <Text style={[styles.buttonText, { color: colors.tint }]} numberOfLines={1}>
                    Chỉnh sửa trang cá nhân
                </Text>
            </Pressable>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.secondaryButton,
                    { borderColor: colors.tint },
                    pressed && styles.pressed,
                ]}
                onPress={onSharePress}
            >
                <Text style={[styles.buttonText, { color: colors.tint }]} numberOfLines={1}>
                    Chia sẻ trang cá nhân
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: s(16),
        paddingVertical: vs(12),
        gap: s(8),
    },
    button: {
        flex: 1,
        paddingVertical: vs(10),
        paddingHorizontal: s(12),
        borderRadius: ms(BorderRadius.lg),
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: vs(44),
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
    },
    buttonText: {
        fontSize: ms(13),
        fontWeight: '600',
        textAlign: 'center',
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
});
