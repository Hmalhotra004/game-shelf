import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import {
  ChartPieIcon,
  CheckIcon,
  LibraryIcon,
  LucideIcon,
  PlayIcon,
  PlusIcon,
} from "lucide-react-native";

interface Props {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
  onAddPress?: (routeName: string) => void;
}

const TAB_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: "Home", icon: ChartPieIcon },
  collection: { label: "Collection", icon: LibraryIcon },
  playthrough: { label: "Playthrough", icon: PlayIcon },
  completion: { label: "Completion", icon: CheckIcon },
};

// Layout constants
const BAR_HEIGHT = 64;
const SIDE_MARGIN = 16;
const RADIUS = 24; // outer corner radius
const NOTCH_HALF_WIDTH = 50; // how wide the dip is (each side of center)
const NOTCH_DEPTH = 40; // how deep the dip goes
const FAB_SIZE = 55;

const buildPath = (w: number, h: number) => {
  const cx = w / 2;
  const r = RADIUS;
  const nw = NOTCH_HALF_WIDTH;
  const nd = NOTCH_DEPTH;

  return [
    `M ${r} 0`,
    `L ${cx - nw} 0`,
    // left half of the notch
    `C ${cx - nw + 24} 0, ${cx - 36} ${nd}, ${cx} ${nd}`,
    // right half of the notch
    `C ${cx + 36} ${nd}, ${cx + nw - 24} 0, ${cx + nw} 0`,
    `L ${w - r} 0`,
    `Q ${w} 0 ${w} ${r}`,
    `L ${w} ${h - r}`,
    `Q ${w} ${h} ${w - r} ${h}`,
    `L ${r} ${h}`,
    `Q 0 ${h} 0 ${h - r}`,
    `L 0 ${r}`,
    `Q 0 0 ${r} 0`,
    "Z",
  ].join(" ");
};

const TabBar = ({ navigation, state, onAddPress }: Props) => {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const { width: screenWidth } = useWindowDimensions();

  const barWidth = screenWidth - SIDE_MARGIN * 2;
  const colors = THEME[theme];

  const visibleRoutes = state.routes.filter((r) => TAB_CONFIG[r.name]);
  const half = Math.ceil(visibleRoutes.length / 2);
  const leftRoutes = visibleRoutes.slice(0, half);
  const rightRoutes = visibleRoutes.slice(half);

  const handleAdd = () => {
    onAddPress?.(state.routes[state.index].name);
  };

  const renderTab = (route: { key: string; name: string }) => {
    const config = TAB_CONFIG[route.name];
    const index = state.routes.findIndex((r) => r.key === route.key);
    const active = state.index === index;
    const Icon = config.icon;

    return (
      <Pressable
        key={route.key}
        testID={`tab-${route.name === "index" ? "insights" : route.name}`}
        accessibilityRole="button"
        accessibilityLabel={config.label}
        accessibilityState={{ selected: active }}
        onPress={() => {
          if (!active) navigation.navigate(route.name);
        }}
        className="flex-1 items-center justify-center"
      >
        <View
          className={cn(
            "h-10 w-10 items-center justify-center",
            active && "bg-primary/15 rounded-2xl",
          )}
        >
          <Icon
            size={22}
            color={active ? colors.primary : colors.mutedForeground}
            strokeWidth={active ? 2.4 : 1.8}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View
      testID="bottom-tab-bar"
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: SIDE_MARGIN,
        right: SIDE_MARGIN,
        bottom: Math.max(insets.bottom, 12),
        height: BAR_HEIGHT,
      }}
    >
      {/* Bar background with the notch */}
      <Svg
        width={barWidth}
        height={BAR_HEIGHT}
        style={{ position: "absolute" }}
      >
        <Path
          d={buildPath(barWidth, BAR_HEIGHT)}
          fill={colors.background}
          stroke={colors.border}
          strokeWidth={1}
        />
      </Svg>

      {/* Tabs: left group | gap for FAB | right group */}
      <View className="flex-1 flex-row items-center">
        <View className="flex-1 flex-row">{leftRoutes.map(renderTab)}</View>
        <View style={{ width: NOTCH_HALF_WIDTH * 2 - 8 }} />
        <View className="flex-1 flex-row">{rightRoutes.map(renderTab)}</View>
      </View>

      {/* Floating + button */}
      <Pressable
        testID="tab-add"
        accessibilityRole="button"
        accessibilityLabel="Add game"
        onPress={handleAdd}
        style={{
          position: "absolute",
          alignSelf: "center",
          top: -(FAB_SIZE - NOTCH_DEPTH) - 4,
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderRadius: FAB_SIZE / 2,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          // soft glow like the reference
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 14,
          elevation: 10,
        }}
      >
        <PlusIcon
          size={28}
          color={colors.primaryForeground}
          strokeWidth={2.6}
        />
      </Pressable>
    </View>
  );
};

export default TabBar;
