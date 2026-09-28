import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ChartPieIcon,
  CircleCheckIcon,
  LibraryIcon,
  LucideIcon,
  PlayCircleIcon,
} from "lucide-react-native";

interface Props {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

const TabBar = ({ navigation, state }: Props) => {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);

  const TAB_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
    index: { label: "Home", icon: ChartPieIcon },
    collection: { label: "Collection", icon: LibraryIcon },
    playthrough: { label: "Playthrough", icon: PlayCircleIcon },
    completion: { label: "Completion", icon: CircleCheckIcon },
  };

  return (
    <View
      testID="bottom-tab-bar"
      className="flex-row border-t border-border bg-background pt-2 mt-0 top-0"
      style={{ paddingBottom: Math.max(insets.bottom + 8, 8) }}
    >
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name];
        if (!config) return null;
        const active = state.index === index;
        const Icon = config.icon;

        return (
          <Pressable
            key={route.key}
            testID={`tab-${route.name === "index" ? "insights" : route.name}`}
            onPress={() => {
              if (!active) navigation.navigate(route.name);
            }}
            className="flex-1 items-center justify-center"
          >
            <View
              className={cn(
                "h-8 w-8 items-center justify-center",
                active && "bg-primary/15 rounded-xl",
              )}
            >
              <Icon
                size={19}
                color={
                  active ? THEME[theme].primary : THEME[theme].mutedForeground
                }
                strokeWidth={active ? 2.4 : 1.8}
              />
            </View>

            <Text
              className={cn(
                "text-2xs font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default TabBar;
