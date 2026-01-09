import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/shared/components/feedback';
import { Colors, Spacing } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

/**
 * Placeholder content for Messages tab
 */
export function MessagesTab() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <EmptyState
        icon="chat-bubble-outline"
        title="Tin nhắn"
        message="Tính năng tin nhắn đang được phát triển. Vui lòng quay lại sau!"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
});
