import GameSearchCard from "@/components/collection/search/GameSearchCard";
import SearchBar from "@/components/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import type { SearchGameClientResponse } from "@repo/schemas/types/igdb";
import { useDebounce } from "@repo/utils/hooks/useDebounce";
import { searchGameQueryOptions } from "@repo/utils/queries/igdb";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, Text, View } from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

type Game = SearchGameClientResponse[number];

interface Props {
  sheetRef: RefObject<BottomSheetModal | null>;
}

const MIN_QUERY_LENGTH = 2;

const SearchBottomSheet = ({ sheetRef }: Props) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const theme = useThemeStore((s) => s.theme);
  const router = useRouter();

  const debouncedSearch = useDebounce(search.trim(), 400);
  const canSearch = debouncedSearch.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!isOpen) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        sheetRef.current?.dismiss();
        return true;
      },
    );

    return () => subscription.remove();
  }, [isOpen, sheetRef]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  const snapPoints = useMemo(() => ["91%"], []);

  const { data, isFetching, isError, error } = useQuery({
    ...searchGameQueryOptions(api, canSearch, debouncedSearch),
    placeholderData: keepPreviousData, // avoids list flicker between queries
  });

  // Clear selection whenever the results change
  useEffect(() => {
    setSelectedId(null);
  }, [debouncedSearch]);

  const handlePress = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleAddToWishlist = useCallback((game: Game) => {
    // TODO: wishlist mutation
    console.log("wishlist", game.id);
  }, []);

  const handleAddToCollection = useCallback((game: Game) => {
    router.push({ pathname: "/(collection)/add", params: { igdbId: game.id } });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Game }) => (
      <GameSearchCard
        game={item}
        selected={item.id === selectedId}
        onPress={handlePress}
        onAddToWishlist={handleAddToWishlist}
        onAddToCollection={handleAddToCollection}
      />
    ),
    [selectedId, handlePress, handleAddToWishlist, handleAddToCollection],
  );

  const renderEmpty = () => {
    if (!canSearch) {
      return (
        <Text className="mt-8 text-center text-muted-foreground">
          Type at least {MIN_QUERY_LENGTH} characters to search
        </Text>
      );
    }

    if (isFetching) return null;

    if (isError) {
      return (
        <Text className="mt-8 text-center text-destructive">
          {error instanceof Error ? error.message : "Something went wrong"}
        </Text>
      );
    }
    return (
      <Text className="mt-8 text-center text-muted-foreground">
        No games found
      </Text>
    );
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(index) => setIsOpen(index >= 0)}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: THEME[theme].background }}
      handleIndicatorStyle={{ backgroundColor: THEME[theme].mutedForeground }}
      onDismiss={() => {
        setIsOpen(false);
        setSelectedId(null);
      }}
    >
      <View className="flex-1 px-4">
        <SearchBar
          onChangeText={setSearch}
          value={search}
        />

        {isFetching && (
          <View className="py-2 gap-2">
            {Array.from({ length: 10 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-24 rounded-xl"
              />
            ))}
          </View>
        )}

        <BottomSheetFlatList
          data={canSearch ? (data ?? []) : []}
          keyExtractor={(item: Game) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </BottomSheetModal>
  );
};

export default SearchBottomSheet;
