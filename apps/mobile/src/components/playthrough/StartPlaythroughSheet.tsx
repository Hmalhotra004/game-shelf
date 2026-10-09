import Loader from "@/components/Loader";
import StartPlaythroughCard from "@/components/playthrough/StartPlaythroughCard";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { cn, handleError } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { GameType } from "@repo/schemas/types/index";
import { GetGamesType } from "@repo/schemas/types/user";
import { startPlaythroughMutationOptions } from "@repo/utils/mutations/playthrough";
import { userGetCollectionQueryOptions } from "@repo/utils/queries/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

interface Props {
  sheetRef: RefObject<BottomSheetModal | null>;
}

type GameItem = GetGamesType["games"][number];
type DlcItem = GetGamesType["dlcs"][number];
type ListItem = GameItem | DlcItem;

const KINDS: { value: GameType; label: string }[] = [
  { value: "Game", label: "Game" },
  { value: "DLC", label: "DLC" },
];

const StartPlaythroughSheet = ({ sheetRef }: Props) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [kind, setKind] = useState<GameType>("Game");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const theme = useThemeStore((s) => s.theme);
  const queryClient = useQueryClient();

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

  const { data, isLoading, isError, error } = useQuery(
    userGetCollectionQueryOptions(api, isOpen),
  );

  // Pick the list for the active tab, then filter it by the search text
  const items: ListItem[] = useMemo(() => {
    if (!data) return [];
    const list: ListItem[] = kind === "DLC" ? data.dlcs : data.games;
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => item.name.toLowerCase().includes(q));
  }, [data, kind, search]);

  // Clear selection when search or tab changes
  useEffect(() => {
    setSelectedId(null);
  }, [search, kind]);

  const startPlaythrough = useMutation(
    startPlaythroughMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => {
        sheetRef.current?.dismiss();
      },
    ),
  );

  const handlePress = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleStart = async () => {
    if (selectedId == null || startPlaythrough.isPending) return;
    await startPlaythrough.mutateAsync({
      gameType: kind,
      ...(kind === "DLC"
        ? { dlcId: selectedId }
        : { collectionId: selectedId }),
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => (
      <StartPlaythroughCard
        item={item}
        selected={item.id === selectedId}
        onPress={handlePress}
      />
    ),
    [selectedId, handlePress],
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    if (isError) {
      return (
        <Text className="mt-8 text-center text-destructive">
          {error instanceof Error ? error.message : "Something went wrong"}
        </Text>
      );
    }

    return (
      <Text className="mt-8 text-center text-muted-foreground">
        {kind === "DLC" ? "No DLC found" : "No games found"}
      </Text>
    );
  };

  const canStart = selectedId != null && !startPlaythrough.isPending;

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
        setKind("Game");
        setSearch("");
        startPlaythrough.reset();
      }}
    >
      <View className="flex-1 px-4">
        <SearchBar
          onChangeText={setSearch}
          value={search}
        />

        {/* Game / DLC toggle */}
        <View className="mt-3 flex-row rounded-xl bg-muted p-1">
          {KINDS.map(({ value, label }) => {
            const active = kind === value;
            return (
              <Pressable
                key={value}
                onPress={() => setKind(value)}
                className={cn(
                  "flex-1 items-center rounded-lg py-2",
                  active ? "bg-background" : "",
                )}
              >
                <Text
                  className={cn(
                    "font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <View className="py-3 gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-24 rounded-xl"
              />
            ))}
          </View>
        ) : (
          <BottomSheetFlatList
            data={items}
            keyExtractor={(item: ListItem) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}

        {/* Bottom actions */}
        <View className="flex-row gap-3 pb-6 pt-3">
          <Button
            variant="outline"
            className="flex-1"
            disabled={startPlaythrough.isPending}
            onPress={() => sheetRef.current?.dismiss()}
          >
            <Text className="font-medium text-foreground">Cancel</Text>
          </Button>

          <Button
            className="flex-1"
            disabled={!canStart}
            onPress={handleStart}
          >
            {startPlaythrough.isPending ? (
              <Loader color={THEME[theme].background} />
            ) : (
              <Text className="font-medium text-primary-foreground">Start</Text>
            )}
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
};

export default StartPlaythroughSheet;
