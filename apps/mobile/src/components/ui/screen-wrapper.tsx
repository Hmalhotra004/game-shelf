import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import React from "react";
import { Dimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
  className?: ClassValue;
  paddingTop?: number;
  paddingBottom?: number;
  paddingHorizontal?: number;
}

const ScreenWrapper = ({
  children,
  className,
  paddingTop,
  paddingBottom,
  paddingHorizontal,
}: Props) => {
  const { width } = Dimensions.get("window");
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn("flex-1 bg-background", className)}
      style={{
        paddingTop: paddingTop !== undefined ? paddingTop : insets.top,
        paddingBottom:
          paddingBottom !== undefined ? paddingBottom : insets.bottom + 10,
        paddingHorizontal:
          paddingHorizontal !== undefined
            ? paddingHorizontal
            : Math.max(16, width * 0.045),
      }}
    >
      {children}
    </View>
  );
};

export default ScreenWrapper;
