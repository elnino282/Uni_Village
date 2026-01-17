/**
 * SocialAuthButtons Component
 * Google and Facebook circular buttons
 */

import { Colors, Shadows } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface SocialAuthButtonsProps {
    onGooglePress: () => void;
    onFacebookPress: () => void;
}

export function SocialAuthButtons({
    onGooglePress,
    onFacebookPress,
}: SocialAuthButtonsProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: colors.card },
                    pressed && styles.buttonPressed,
                ]}
                onPress={onGooglePress}
            >
                <Ionicons name="logo-google" size={24} color="#DB4437" />
            </Pressable>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: colors.card },
                    pressed && styles.buttonPressed,
                ]}
                onPress={onFacebookPress}
            >
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
    },
    button: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.md,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
});
