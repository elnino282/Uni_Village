/**
 * ProfileInfo Component
 * Displays user's display name, username, and bio (simplified version for main profile screen)
 */

import { Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Profile } from '../types';

interface ProfileInfoProps {
    profile: Profile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <Text style={[styles.displayName, { color: colors.text }]}>
                {profile.displayName}
            </Text>
            <Text style={[styles.username, { color: colors.icon }]}>
                {profile.username}
            </Text>
            {profile.bio && (
                <Text style={[styles.bio, { color: colors.text }]}>
                    {profile.bio}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.md,
    },
    displayName: {
        fontSize: Typography.sizes['2xl'],
        fontWeight: Typography.weights.bold,
        marginBottom: Spacing.xs,
    },
    username: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.normal,
        marginBottom: Spacing.sm,
    },
    bio: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.normal,
        lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
        marginTop: Spacing.xs,
    },
});
