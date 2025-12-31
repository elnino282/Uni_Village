/**
 * Providers Composition
 * Combines all providers for the app
 */

import { ErrorBoundary } from '@/shared/components/feedback';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider, useTheme } from './ThemeProvider';

interface ProvidersProps {
    children: React.ReactNode;
}

// Inner component that uses theme context
function InnerProviders({ children }: ProvidersProps) {
    const { colorScheme } = useTheme();

    return (
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {children}
        </NavigationThemeProvider>
    );
}

// Main providers wrapper
export function Providers({ children }: ProvidersProps) {
    return (
        <ErrorBoundary>
            <QueryProvider>
                <ThemeProvider>
                    <InnerProviders>
                        {children}
                    </InnerProviders>
                </ThemeProvider>
            </QueryProvider>
        </ErrorBoundary>
    );
}
