import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

/**
 * Channel Thread placeholder screen
 * Route: /channel/[channelId]
 */
export default function ChannelThreadRoute() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const router = useRouter();
    const { channelId } = useLocalSearchParams<{ channelId: string }>();

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.actionBlue }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Channel Chat</Text>
                <View style={styles.menuButton} />
            </View>

            {/* Placeholder content */}
            <View style={styles.content}>
                <MaterialIcons name="chat" size={64} color={colors.textSecondary} />
                <Text style={[styles.placeholderTitle, { color: colors.textPrimary }]}>
                    Channel Thread
                </Text>
                <Text style={[styles.placeholderSubtitle, { color: colors.textSecondary }]}>
                    Channel ID: {channelId}
                </Text>
                <Text style={[styles.placeholderDescription, { color: colors.textSecondary }]}>
                    Chat functionality will be implemented in a future update.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        color: '#ffffff',
        flex: 1,
        textAlign: 'center',
    },
    menuButton: {
        width: 40,
        height: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
    },
    placeholderTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.semibold,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    placeholderSubtitle: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
        marginBottom: Spacing.sm,
    },
    placeholderDescription: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.normal,
        textAlign: 'center',
    },
});
