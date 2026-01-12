/**
 * LogoutCard Component
 * Danger action card for logout with confirmation dialog
 */

import { BorderRadius, Shadows, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

// Settings-specific danger colors
const DANGER_COLORS = {
    light: {
        background: '#fef2f2',
        border: '#fecaca',
        text: '#dc2626',
        iconBackground: '#fee2e2',
    },
    dark: {
        background: '#450a0a',
        border: '#7f1d1d',
        text: '#fca5a5',
        iconBackground: '#7f1d1d',
    },
};

interface LogoutCardProps {
    onLogout: () => void;
}

export function LogoutCard({ onLogout }: LogoutCardProps) {
    const colorScheme = useColorScheme();
    const dangerColors = DANGER_COLORS[colorScheme];

    const handlePress = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: onLogout,
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: dangerColors.background,
                    borderColor: dangerColors.border,
                },
                Shadows.sm,
                pressed && { opacity: 0.8 },
            ]}
            onPress={handlePress}
        >
            {/* Icon Tile */}
            <View
                style={[
                    styles.iconTile,
                    { backgroundColor: dangerColors.iconBackground },
                ]}
            >
                <MaterialIcons name="logout" size={20} color={dangerColors.text} />
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: dangerColors.text }]}>
                    Đăng xuất
                </Text>
                <Text style={[styles.subtitle, { color: dangerColors.text }]}>
                    Thoát khỏi tài khoản
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    iconTile: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm + 4,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: Typography.sizes.sm,
    },
});
