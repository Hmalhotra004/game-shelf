import ThemeProvider from "@/providers/ThemeProvider";
import { useThemeStore } from "@/store/useThemeStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import "../globals.css";

export default function RootLayout() {
  const themeHydrated = useThemeStore((state) => state.hasHydrated);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),

            staleTime: 1000 * 60 * 10,
            gcTime: 1000 * 60 * 15,

            refetchOnWindowFocus: false,
            refetchOnReconnect: true,

            networkMode: "offlineFirst",
          },

          mutations: {
            retry: 0,
            networkMode: "offlineFirst",
          },
        },
      }),
    [],
  );

  if (!themeHydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <SafeAreaProvider>
              <Slot />

              <Toast />
              <PortalHost />
            </SafeAreaProvider>
          </BottomSheetModalProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
