/**
 * PublicProfileTabs Component
 * Tabs for posts and saved posts
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

import type { PublicProfileTab } from '../types';

interface PublicProfileTabsProps {
  activeTab: PublicProfileTab;
  onTabChange: (tab: PublicProfileTab) => void;
}

const TABS: { key: PublicProfileTab; label: string }[] = [
  { key: 'posts', label: 'Bài viết của họ' },
  { key: 'saved', label: 'Bài viết đã lưu' },
];

export function PublicProfileTabs({ activeTab, onTabChange }: PublicProfileTabsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { borderBottomColor: colors.borderLight }]}>
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
                { color: isActive ? colors.actionBlue : colors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View
                style={[styles.indicator, { backgroundColor: colors.actionBlue }]}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: Spacing.sm,
  },
  tabText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    lineHeight: 20,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    left: Spacing.lg,
    right: Spacing.lg,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
});
