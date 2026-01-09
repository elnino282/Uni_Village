/**
 * PostDetailMedia Component
 * Large post image with rounded corners and shadow
 */

import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BorderRadius, Shadows, Spacing } from '@/shared/constants';

interface PostDetailMediaProps {
  imageUrl: string;
}

export function PostDetailMedia({ imageUrl }: PostDetailMediaProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.cardPadding - 4, // 12px
    marginTop: Spacing.sm,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: BorderRadius.lg + 2, // 14px as per Figma
    ...Shadows.md,
  },
});
