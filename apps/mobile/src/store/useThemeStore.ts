import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme } from "@repo/schemas/types/index";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ThemeStore {
  theme: Theme;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "dark",
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const newTheme = get().theme === "light" ? "dark" : "light";
        set({ theme: newTheme });
      },
    }),
    {
      name: "gameshelf-theme",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Theme rehydration failed:", error);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
