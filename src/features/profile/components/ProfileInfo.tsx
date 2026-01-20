/**
 * ProfileInfo Component
 * Displays user's display name and bio (text only - FAB serves as avatar)
 */

import { Colors } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ms, s, vs } from 'react-native-size-matters';
import type { Profile } from '../types';

interface ProfileInfoProps {
    profile: Profile;
    /** Optional container style for layout customization */
    style?: ViewStyle;
}

export function ProfileInfo({ profile, style }: ProfileInfoProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.displayName, { color: colors.text }]}>
                {profile.displayName}
            </Text>
            {profile.bio && (
                <Text style={[styles.bio, { color: colors.textSecondary }]}>
                    {profile.bio}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: s(16),
        paddingTop: vs(24),
        paddingBottom: vs(8),
    },
    displayName: {
        fontSize: ms(28),
        fontWeight: '700',
        marginBottom: vs(8),
    },
    bio: {
        fontSize: ms(15),
        fontWeight: '400',
        lineHeight: ms(22),
    },
});

