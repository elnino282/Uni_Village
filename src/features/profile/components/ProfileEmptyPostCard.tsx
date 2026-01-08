/**
 * ProfileEmptyPostCard Component
 * Empty state card shown when user has no posts
 */

import { Button, Card } from '@/shared/components/ui';
import { Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileEmptyPostCardProps {
    onCreatePost?: () => void;
}

export function ProfileEmptyPostCard({ onCreatePost }: ProfileEmptyPostCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <Card variant="elevated" padding="lg" style={styles.card}>
                {/* Icon in soft circle */}
                <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
                    <MaterialIcons name="edit" size={28} color={colors.tint} />
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: colors.text }]}>
                    Đăng bài viết
                </Text>

                {/* Subtitle */}
                <Text style={[styles.subtitle, { color: colors.icon }]}>
                    Chia sẻ những suy nghĩ hoặc hoạt động gần đây.
                </Text>

                {/* CTA Button */}
                <Button
                    title="Đăng"
                    variant="primary"
                    size="md"
                    fullWidth
                    onPress={onCreatePost}
                    style={styles.button}
                />
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.lg,
    },
    card: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.normal,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        lineHeight: Typography.sizes.md * Typography.lineHeights.normal,
    },
    button: {
        marginTop: Spacing.xs,
    },
});
