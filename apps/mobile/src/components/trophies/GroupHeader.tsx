import { Text } from "@/components/ui/text";
import { TROPHY_COLORS } from "@repo/utils/lib/trophies";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react-native";
import { memo } from "react";
import { Pressable } from "react-native";

interface Props {
  name: string;
  unlocked: number;
  total: number;
  collapsed: boolean;
  onToggle: () => void;
}

function TrophyGroupHeaderBase({
  name,
  unlocked,
  total,
  collapsed,
  onToggle,
}: Props) {
  const Chevron = collapsed ? ChevronRightIcon : ChevronDownIcon;

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityState={{ expanded: !collapsed }}
      className="mb-3 flex-row items-center gap-3 border-b border-border pb-2 pt-1 active:opacity-70"
    >
      <Chevron
        size={18}
        color={TROPHY_COLORS.Common}
      />

      <Text
        className="flex-1 text-base font-semibold"
        numberOfLines={1}
      >
        {name}
      </Text>

      <Text className="shrink-0 text-xs text-muted-foreground">
        {unlocked}/{total}
      </Text>
    </Pressable>
  );
}

const TrophyGroupHeader = memo(TrophyGroupHeaderBase);
export default TrophyGroupHeader;
