import Header from "@/components/Header";
import TrophyGroupHeader from "@/components/trophies/GroupHeader";
import TrophySummary from "@/components/trophies/Summary";
import TrophyItem from "@/components/trophies/TrophyItem";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PlatformType, ProviderType } from "@repo/schemas/types/index";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import {
  collectionGetPSNTrophiesQueryOptions,
  collectionGetSteamAchievementsQueryOptions,
} from "@repo/utils/queries/collection";

import {
  buildTrophyRows,
  getCategoryCounts,
  type TrophyFilter,
  type TrophyListRow,
} from "@repo/utils/lib/trophies";

export default function Trophies() {
  const { collectionId, platform, provider } = useLocalSearchParams<{
    collectionId: string;
    platform: PlatformType;
    provider: ProviderType;
  }>();

  const isPS = platform === "PS";
  const isXbox = platform === "XBOX";
  const isSteam = platform === "PC" && provider === "Steam";
  const isEpic = platform === "PC" && provider === "Epic";
  const label = isPS ? "Trophies" : "Achievements";

  const psnQuery = useQuery(
    collectionGetPSNTrophiesQueryOptions(api, collectionId, isPS),
  );
  const steamQuery = useQuery(
    collectionGetSteamAchievementsQueryOptions(api, collectionId, isSteam),
  );

  const query = isPS ? psnQuery : steamQuery;
  const { data, isLoading, isError, error, refetch, isRefetching } = query;

  const [filter, setFilter] = useState<TrophyFilter>("all");
  const [versionIndex, setVersionIndex] = useState(0);

  // Keys of group headers that are collapsed. Empty = every group expanded.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const toggleGroup = useCallback((key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // PS collections can own several versions (PS4 + PS5), each with its own list.
  const versions = data ?? [];
  const version = versions[Math.min(versionIndex, versions.length - 1)];

  const rows = useMemo(
    () => (version ? buildTrophyRows(version, isPS, filter) : []),
    [version, isPS, filter],
  );

  // Headers only exist when there is more than one group, so with a single
  // group nothing is ever hidden. Trophy rows follow their header, so hide
  // every trophy row that sits under a collapsed header.
  const visibleRows = useMemo(() => {
    if (collapsed.size === 0) return rows;

    const result: TrophyListRow[] = [];
    let hidden = false;

    for (const row of rows) {
      if (row.kind === "header") {
        hidden = collapsed.has(row.key);
        result.push(row);
      } else if (!hidden) {
        result.push(row);
      }
    }

    return result;
  }, [rows, collapsed]);

  const counts = useMemo(
    () => (version ? getCategoryCounts(version.groups, isPS) : []),
    [version, isPS],
  );

  const renderState = () => {
    if (isEpic) {
      return (
        <Text className="text-center text-muted-foreground">
          Achievements are not supported on Epic.
        </Text>
      );
    }

    if (isXbox) {
      return (
        <Text className="text-center text-muted-foreground">
          Achievements are comming soon supported on XBOX.
        </Text>
      );
    }

    if (isLoading) {
      return (
        <View className="gap-3 flex-1">
          <Skeleton className="h-32 w-full rounded-xl" />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-20 w-full rounded-xl"
            />
          ))}
        </View>
      );
    }

    if (isError) {
      return (
        <View className="items-center gap-3">
          <Text className="text-center text-destructive">
            {error instanceof Error
              ? error.message
              : `Failed to load ${label.toLowerCase()}.`}
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="rounded-full bg-primary px-5 py-2"
          >
            <Text className="text-primary-foreground">Retry</Text>
          </Pressable>
        </View>
      );
    }

    if (!version || version.total === 0) {
      return (
        <Text className="text-center text-muted-foreground">
          No {label.toLowerCase()} available.
        </Text>
      );
    }

    return null;
  };

  const stateView = renderState();

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        {stateView ? (
          <View className="flex-1 justify-center">{stateView}</View>
        ) : (
          <FlashList<TrophyListRow>
            data={visibleRows}
            extraData={collapsed}
            keyExtractor={(row) => row.key}
            getItemType={(row) => row.kind}
            refreshing={isRefetching}
            onRefresh={refetch}
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              version ? (
                <View>
                  {versions.length > 1 && (
                    <View className="mb-3 flex-row gap-2">
                      {versions.map((v, i) => (
                        <Pressable
                          key={v.version ?? i}
                          onPress={() => setVersionIndex(i)}
                          className={cn(
                            "rounded-full border px-4 py-1.5",
                            i === versionIndex
                              ? "border-primary bg-primary"
                              : "border-border bg-card",
                          )}
                        >
                          <Text
                            className={
                              i === versionIndex
                                ? "text-primary-foreground"
                                : "text-foreground"
                            }
                          >
                            {v.version ?? "Base"}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  <TrophySummary
                    unlocked={version.unlocked}
                    total={version.total}
                    isPS={isPS}
                    counts={counts}
                    filter={filter}
                    onFilterChange={setFilter}
                  />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <Text className="mt-8 text-center text-muted-foreground">
                No {filter} {label.toLowerCase()}.
              </Text>
            }
            renderItem={({ item }) =>
              item.kind === "header" ? (
                <TrophyGroupHeader
                  name={item.name}
                  unlocked={item.unlocked}
                  total={item.total}
                  collapsed={collapsed.has(item.key)}
                  onToggle={() => toggleGroup(item.key)}
                />
              ) : (
                <TrophyItem
                  trophy={item.trophy}
                  isPS={isPS}
                />
              )
            }
          />
        )}
      </ScreenWrapper>
    </View>
  );
}
