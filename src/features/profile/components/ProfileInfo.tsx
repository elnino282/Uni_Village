/**
 * ProfileInfo Component
 * Displays user's display name, username, and bio (simplified version for main profile screen)
 */

import { Colors } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ms, s, vs } from 'react-native-size-matters';
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
        paddingHorizontal: s(16),
        paddingTop: vs(16),
    },
    displayName: {
        fontSize: ms(24),
        fontWeight: '700',
        marginBottom: vs(4),
    },
    username: {
        fontSize: ms(14),
        fontWeight: '400',
        marginBottom: vs(8),
    },
    bio: {
        fontSize: ms(16),
        fontWeight: '400',
        lineHeight: ms(24),
        marginTop: vs(4),
    },
});
