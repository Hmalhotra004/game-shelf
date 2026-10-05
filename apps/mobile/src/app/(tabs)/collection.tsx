import CollectionFilters from "@/components/collection/CollectionFilters";
import Header from "@/components/Header";
import Loader from "@/components/Loader";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { useCollectionFilterStore } from "@/store/useCollectionFilterStore";
import { CollectionGetMany } from "@repo/schemas/types/collection";
import { useDebounce } from "@repo/utils/hooks/useDebounce";
import { collectionGetManyQueryOptions } from "@repo/utils/queries/collection";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";

const Collection = () => {
  const search = useCollectionFilterStore((s) => s.search);
  const platform = useCollectionFilterStore((s) => s.platform);
  const status = useCollectionFilterStore((s) => s.status);
  const lists = useCollectionFilterStore((s) => s.lists);
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
  } = useInfiniteQuery(collectionGetManyQueryOptions(api, filters));

  const games = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  // totals describe the whole filtered set, so page 1 is enough
  const total = data?.pages[0]?.total ?? 0;
  const totalAmount = data?.pages[0]?.totalAmount ?? 0;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: CollectionGetMany }) => (
      <View>
        <Text>{item.name.charAt(0)}</Text>
      </View>
      // <CollectionCard game={item} />
    ),
    [],
  );

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={12}>
        <View className="flex-1">
          <CollectionFilters />

          {/* totals */}
          {!isLoading && !isError && (
            <View className="mb-3 flex-row justify-between">
              <Text className="text-sm text-muted-foreground">
                {total} {total === 1 ? "game" : "games"}
              </Text>
              <Text className="text-sm text-muted-foreground">
                Total spent: {totalAmount.toFixed(2)}
              </Text>
            </View>
          )}

          {/* list */}
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
              <Text className="mb-3 text-muted-foreground">
                Couldn't load your collection.
              </Text>
              <Pressable onPress={() => refetch()}>
                <Text className="font-semibold text-primary">Try again</Text>
              </Pressable>
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
              ListEmptyComponent={
                <View className="items-center py-16">
                  <Text className="text-muted-foreground">No games found</Text>
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

export default Collection;
