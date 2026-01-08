/**
 * ProfileTabs Component
 * Two tabs: "Bài viết của tôi" and "Bài viết yêu thích" with underline indicator
 */

import { Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type ProfileTabKey = 'my-posts' | 'favorites';

interface ProfileTabsProps {
    activeTab: ProfileTabKey;
    onTabChange: (tab: ProfileTabKey) => void;
}

const TABS: { key: ProfileTabKey; label: string }[] = [
    { key: 'my-posts', label: 'Bài viết của tôi' },
    { key: 'favorites', label: 'Bài viết yêu thích' },
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <Pressable
                        key={tab.key}
                        style={styles.tab}
                        onPress={() => onTabChange(tab.key)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isActive }}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                {
                                    color: isActive ? colors.tint : colors.icon,
                                    fontWeight: isActive
                                        ? Typography.weights.semibold
                                        : Typography.weights.normal,
                                },
                            ]}
                        >
                            {tab.label}
                        </Text>
                        {isActive && (
                            <View
                                style={[styles.indicator, { backgroundColor: colors.tint }]}
                            />
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.md,
        position: 'relative',
    },
    tabText: {
        fontSize: Typography.sizes.md,
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        left: Spacing.lg,
        right: Spacing.lg,
        height: 3,
        borderRadius: 2,
    },
});
