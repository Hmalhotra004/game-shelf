import CompletionCard from "@/components/completion/CompletionCard";
import CompletionFilters from "@/components/completion/CompletionFilters";
import Header from "@/components/Header";
import Loader from "@/components/Loader";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { CompletionGetMany } from "@repo/schemas/types/completion";
import { useDebounce } from "@repo/utils/hooks/useDebounce";
import { betterTimeText } from "@repo/utils/lib/utils";
import { completionGetManyQueryOptions } from "@repo/utils/queries/completion";
import { useCompletionFilterStore } from "@repo/utils/store/useCompletionFilterStore";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";

const Completion = () => {
  const search = useCompletionFilterStore((s) => s.search);
  const platform = useCompletionFilterStore((s) => s.platform);
  const style = useCompletionFilterStore((s) => s.style);
  const lists = useCompletionFilterStore((s) => s.lists);
  const debouncedSearch = useDebounce(search.trim() || undefined, 400);

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      platform: platform.length ? platform : undefined,
      style: style.length ? style : undefined,
      lists: lists.length ? lists : undefined,
    }),
    [debouncedSearch, platform, style, lists],
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
  } = useInfiniteQuery(completionGetManyQueryOptions(api, filters));

  const completions = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  // totals describe the whole filtered set, so page 1 is enough
  const total = data?.pages[0]?.total ?? 0;
  const totalPlaytime = data?.pages[0]?.totalPlaytime ?? 0;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: CompletionGetMany }) => (
      <CompletionCard completion={item} />
    ),
    [],
  );

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={12}>
        <View className="flex-1">
          <CompletionFilters />

          {/* totals */}
          {!isLoading && !isError && (
            <View className="mb-3 flex-row justify-between">
              <Text className="text-sm text-muted-foreground">
                {total} {total === 1 ? "completion" : "completions"}
              </Text>
              <Text className="text-sm text-muted-foreground">
                Total playtime: {betterTimeText(totalPlaytime)}
              </Text>
            </View>
          )}

          {/* list */}
          {isLoading ? (
            <View className="flex-1 gap-2">
              {Array.from({ length: 10 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-28 rounded-2xl"
                />
              ))}
            </View>
          ) : isError ? (
            <View className="flex-1 items-center justify-center">
              <Text className="mb-3 text-muted-foreground">
                Couldn't load your completions.
              </Text>
              <Pressable onPress={() => refetch()}>
                <Text className="font-semibold text-primary">Try again</Text>
              </Pressable>
            </View>
          ) : (
            <FlashList
              data={completions}
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
                    No completions found
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

export default Completion;
