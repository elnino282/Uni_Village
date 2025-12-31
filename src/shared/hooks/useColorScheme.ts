/**
 * useColorScheme Hook
 * Returns the current color scheme (light/dark)
 */

import { useColorScheme as useNativeColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme {
    const colorScheme = useNativeColorScheme();
    return colorScheme ?? 'light';
}
