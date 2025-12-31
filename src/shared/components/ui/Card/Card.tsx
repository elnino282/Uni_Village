/**
 * Card Component
 * Base card container with variants
 */

import React from 'react';
import { Pressable, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps extends ViewProps {
    variant?: CardVariant;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onPress?: () => void;
    style?: ViewStyle;
    children: React.ReactNode;
}

export function Card({
    variant = 'elevated',
    padding = 'md',
    onPress,
    style,
    children,
    ...viewProps
}: CardProps) {
    const cardStyle = [
        styles.base,
        styles[variant],
        styles[`padding_${padding}`],
        style,
    ];

    if (onPress) {
        return (
            <Pressable
                style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
                onPress={onPress}
                {...viewProps}
            >
                {children}
            </Pressable>
        );
    }

    return (
        <View style={cardStyle} {...viewProps}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    // Variants
    elevated: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    outlined: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filled: {
        backgroundColor: '#f8fafc',
    },
    // Padding
    padding_none: {
        padding: 0,
    },
    padding_sm: {
        padding: 12,
    },
    padding_md: {
        padding: 16,
    },
    padding_lg: {
        padding: 24,
    },
    // States
    pressed: {
        opacity: 0.95,
        transform: [{ scale: 0.99 }],
    },
});
