import Header from "@/components/Header";
import Loader from "@/components/Loader";
import PlaythroughCard2 from "@/components/playthrough/Playthroughcard2";
import PlaythroughFilters from "@/components/playthrough/PlaythroughFilters";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { PlaythroughGetManyType } from "@repo/schemas/types/playthrough";
import { useDebounce } from "@repo/utils/hooks/useDebounce";
import { betterTimeText } from "@repo/utils/lib/utils";
import { PlaythroughGetManyQueryOptions } from "@repo/utils/queries/playthrough";
import { usePlaythroughFilterStore } from "@repo/utils/store/usePlaythroughFilterStore";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { View } from "react-native";

const Playthrough = () => {
  const search = usePlaythroughFilterStore((s) => s.search);
  const platform = usePlaythroughFilterStore((s) => s.platform);
  const status = usePlaythroughFilterStore((s) => s.status);
  const lists = usePlaythroughFilterStore((s) => s.lists);
  const debouncedSearch = useDebounce(search.trim() || undefined, 400);

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      platform: platform.length ? platform : undefined,
      status: status.length ? status : undefined,
      lists: lists.length ? lists : undefined,
    }),
    [debouncedSearch, platform, status],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useInfiniteQuery(PlaythroughGetManyQueryOptions(api, filters));

  const games = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  // totals describe the whole filtered set, so page 1 is enough
  const total = data?.pages[0]?.total ?? 0;
  const totalSecs = data?.pages[0]?.totalSeconds ?? 0;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: PlaythroughGetManyType }) => (
      <PlaythroughCard2 play={item} />
    ),
    [],
  );

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={12}>
        <View className="flex-1">
          <PlaythroughFilters />

          {!isLoading && !isError && (
            <View className="mb-3 flex-row justify-between">
              <Text className="text-sm text-muted-foreground">
                {total} {total === 1 ? "game" : "games"}
              </Text>

              <Text className="text-sm text-muted-foreground">
                {betterTimeText(totalSecs)}
              </Text>
            </View>
          )}

          {isLoading ? (
            <View className="flex-1 gap-2">
              {Array.from({ length: 10 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-24 rounded-xl"
                />
              ))}
            </View>
          ) : isError ? (
            <View className="flex-1 items-center justify-center">
              <Text className="mb-2 text-muted-foreground">
                Couldn't load your playthroughs.
              </Text>
              <Button
                variant="outline"
                onPress={() => refetch()}
              >
                <Text className="font-semibold">Try again</Text>
              </Button>
            </View>
          ) : (
            <FlashList
              data={games}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              onRefresh={refetch}
              refreshing={isRefetching && !isFetchingNextPage}
              contentContainerClassName="pb-20"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View className="h-2" />}
              ListEmptyComponent={
                <View className="items-center py-16">
                  <Text className="text-muted-foreground">
                    No playthroughs found
                  </Text>
                </View>
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="py-4">
                    <Loader />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </ScreenWrapper>
    </View>
  );
};

export default Playthrough;
