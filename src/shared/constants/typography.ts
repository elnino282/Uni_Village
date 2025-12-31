/**
 * Typography Constants
 * Font sizes and text styles
 */

export const Typography = {
    sizes: {
        xs: 10,
        sm: 12,
        md: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    weights: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
    lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
} as const;

export type FontSize = keyof typeof Typography.sizes;
export type FontWeight = keyof typeof Typography.weights;
