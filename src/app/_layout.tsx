import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ErrorBoundary } from '@/components/error-boundary';
import { useUiStore } from '@/stores/ui.store';
import '@/hooks/use-network-status';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30 } },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { loadThemeMode, loadCenterApp, themeMode } = useUiStore();

  useEffect(() => {
    Promise.all([loadThemeMode(), loadCenterApp()]).finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  const isDark =
    themeMode === 'dark'  ? true  :
    themeMode === 'light' ? false :
    colorScheme === 'dark';

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <Slot />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
