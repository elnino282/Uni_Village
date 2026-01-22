/**
 * Providers Composition
 * Combines all providers for the app
 */

import { SplashProvider } from "@/features/splash";
import { ErrorBoundary } from "@/shared/components/feedback";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FirebaseChatProvider } from "./FirebaseChatProvider";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider, useTheme } from "./ThemeProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

function InnerProviders({ children }: ProvidersProps) {
  const { colorScheme } = useTheme();

  return (
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <BottomSheetModalProvider>
        <FirebaseChatProvider>
          <SplashProvider>{children}</SplashProvider>
        </FirebaseChatProvider>
      </BottomSheetModalProvider>
    </NavigationThemeProvider>
  );
}

// Main providers wrapper
export function Providers({ children }: ProvidersProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryProvider>
          <ThemeProvider>
            <InnerProviders>{children}</InnerProviders>
          </ThemeProvider>
        </QueryProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
