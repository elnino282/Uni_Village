/**
 * PostStatsRow Component
 * Stats row showing likes, comments, and shares count
 */

import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/shared/constants';
import { useColorScheme } from '@/shared/hooks';

interface PostStatsRowProps {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

export function PostStatsRow({ likesCount, commentsCount, sharesCount }: PostStatsRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { borderBottomColor: colors.chipBackground }]}>
      <View style={styles.statsRow}>
        {/* Likes */}
        <View style={styles.statItem}>
          <MaterialIcons name="favorite" size={16} color={colors.heartLiked} />
          <Text style={[styles.statText, { color: colors.statsText }]}>{likesCount}</Text>
        </View>

        {/* Comments */}
        <Text style={[styles.statText, { color: colors.statsText }]}>
          {commentsCount} bình luận
        </Text>

        {/* Shares */}
        <Text style={[styles.statText, { color: colors.statsText }]}>
          {sharesCount} chia sẻ
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.cardPadding - 4, // 12px
    paddingVertical: Spacing.sm + 3, // ~11px
    borderBottomWidth: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.cardPadding - 4, // 12px
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: Typography.sizes['13'], // 13px
    fontWeight: Typography.weights.normal,
    lineHeight: 19.5,
  },
});
