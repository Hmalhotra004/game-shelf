import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { StatusBar } from "expo-status-bar";
import { colorScheme } from "nativewind";
import React, { useEffect } from "react";
import { View } from "react-native";

interface Props {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }: Props) => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    colorScheme.set(theme);
  }, [theme]);

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View
        className="flex-1"
        style={{ backgroundColor: THEME[theme].background }}
      >
        {children}
      </View>
    </>
  );
};

export default ThemeProvider;
