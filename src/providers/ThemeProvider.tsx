/**
 * Theme Provider
 * Provides theme context for the app
 */

import type { ColorScheme } from '@/shared/constants';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

interface ThemeContextValue {
    colorScheme: ColorScheme;
    setColorScheme: (scheme: ColorScheme | 'system') => void;
    toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultScheme?: ColorScheme | 'system';
}

export function ThemeProvider({ children, defaultScheme = 'system' }: ThemeProviderProps) {
    const systemScheme = useSystemColorScheme();
    const [manualScheme, setManualScheme] = useState<ColorScheme | 'system'>(defaultScheme);

    const colorScheme: ColorScheme =
        manualScheme === 'system' ? (systemScheme ?? 'light') : manualScheme;

    const setColorScheme = useCallback((scheme: ColorScheme | 'system') => {
        setManualScheme(scheme);
    }, []);

    const toggleColorScheme = useCallback(() => {
        setManualScheme((current) => {
            if (current === 'system') {
                return systemScheme === 'dark' ? 'light' : 'dark';
            }
            return current === 'dark' ? 'light' : 'dark';
        });
    }, [systemScheme]);

    return (
        <ThemeContext.Provider value={{ colorScheme, setColorScheme, toggleColorScheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
