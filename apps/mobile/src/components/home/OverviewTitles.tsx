import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getOverviewStatsQueryOptions } from "@repo/utils/queries/stats";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";

type StatCard = {
  id: string;
  label: string;
  value: string;
};

const formatNumber = (n: number) => n.toLocaleString();

const SKELETON_ITEMS = Array.from({ length: 6 }, (_, i) => ({ id: String(i) }));

const cardWrapperClass = (index: number): string =>
  cn("mb-3", index % 2 === 0 ? "pr-1.5" : "pl-1.5");

const OverviewTitles = () => {
  const { data, isLoading, isError, error } = useQuery(
    getOverviewStatsQueryOptions(api),
  );

  if (isLoading) {
    return (
      <FlashList
        data={SKELETON_ITEMS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        renderItem={({ index }) => (
          <View className={cardWrapperClass(index)}>
            <View className="rounded-xl border border-border bg-card p-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
            </View>
          </View>
        )}
      />
    );
  }

  // TODO:Add Better error handling
  if (isError || !data) {
    return (
      <View className="items-center justify-center py-8">
        <Text className="text-destructive">
          {error instanceof Error ? error.message : "Failed to load stats"}
        </Text>
      </View>
    );
  }

  const cards: StatCard[] = [
    {
      id: "totalGames",
      label: "Total Games",
      value: formatNumber(data.totalGames),
    },
    {
      id: "totalDLCs",
      label: "Total DLCs",
      value: formatNumber(data.totalDLCs),
    },
    {
      id: "totalPlaytimeHours",
      label: "Playtime",
      value: `${formatNumber(data.totalPlaytimeHours)} hrs`,
    },
    {
      id: "totalSpent",
      label: "Total Spent",
      value: formatNumber(data.totalSpent),
    },
    {
      id: "activePlaythroughs",
      label: "Active Playthroughs",
      value: formatNumber(data.activePlaythroughs),
    },
    {
      id: "completedGames",
      label: "Completed Games",
      value: formatNumber(data.completedGames),
    },
  ];

  return (
    <FlashList
      data={cards}
      keyExtractor={(item) => item.id}
      numColumns={2}
      scrollEnabled={false} // parent screen scrolls; remove if this list is standalone
      renderItem={({ item, index }) => (
        <View className={cardWrapperClass(index)}>
          <View className="rounded-xl border border-border bg-card p-3">
            <Text className="text-sm text-muted-foreground">{item.label}</Text>
            <Text className="mt-1 text-2xl font-bold">{item.value}</Text>
          </View>
        </View>
      )}
    />
  );
};

export default OverviewTitles;
