import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Pressable, View } from "react-native";

import {
  TROPHY_COLORS,
  formatCategory,
  type TrophyFilter,
} from "@repo/utils/lib/trophies";

interface Props {
  unlocked: number;
  total: number;
  isPS: boolean;
  counts: { category: string; unlocked: number; total: number }[];
  filter: TrophyFilter;
  onFilterChange: (filter: TrophyFilter) => void;
}

const FILTERS: { value: TrophyFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unlocked", label: "Unlocked" },
  { value: "locked", label: "Locked" },
];

export default function TrophySummary({
  unlocked,
  total,
  isPS,
  counts,
  filter,
  onFilterChange,
}: Props) {
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <View className="mb-4 gap-4">
      <View className="gap-2 rounded-xl border border-border bg-card p-4">
        <View className="flex-row items-end justify-between">
          <Text className="text-lg font-semibold">
            {isPS ? "Trophies" : "Achievements"}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {unlocked}/{total} · {percent}%
          </Text>
        </View>

        <View className="h-2 overflow-hidden rounded-full bg-muted">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </View>

        <View className="mt-2 flex-row flex-wrap gap-x-4 gap-y-1">
          {counts.map(({ category, unlocked: u, total: t }) => (
            <View
              key={category}
              className="flex-row items-center gap-1.5"
            >
              <View
                className="size-2.5 rounded-full"
                style={{ backgroundColor: TROPHY_COLORS[category] }}
              />
              <Text className="text-xs text-muted-foreground">
                {formatCategory(category)} {u}/{t}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row gap-2">
        {FILTERS.map(({ value, label }) => {
          const active = filter === value;
          return (
            <Pressable
              key={value}
              onPress={() => onFilterChange(value)}
              className={cn(
                "rounded-full border px-4 py-1.5",
                active ? "border-primary bg-primary" : "border-border bg-card",
              )}
            >
              <Text
                className={cn(
                  "text-sm",
                  active ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
