/**
 * ProfileFAB Component
 * Floating action button with person icon and plus badge overlay
 */

import { Colors, Shadows } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface ProfileFABProps {
    onPress?: () => void;
}

const FAB_SIZE = 56;
const BADGE_SIZE = 20;

export function ProfileFAB({ onPress }: ProfileFABProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <Pressable
                style={({ pressed }) => [
                    styles.fab,
                    { backgroundColor: colors.tint },
                    pressed && styles.pressed,
                ]}
                onPress={onPress}
                accessibilityLabel="Add friend"
                accessibilityRole="button"
            >
                <MaterialIcons name="person" size={28} color="#fff" />
                {/* Plus badge overlay */}
                <View style={styles.badge}>
                    <MaterialIcons name="add" size={14} color="#fff" />
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 16,
        top: 120,
        zIndex: 10,
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.lg,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.95 }],
    },
    badge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: BADGE_SIZE,
        height: BADGE_SIZE,
        borderRadius: BADGE_SIZE / 2,
        backgroundColor: '#22c55e',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
});
