import MultiSelectBottomSheet from "@/components/form/MultiSelectBottomSheet";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { listGetManyQueryOptions } from "@repo/utils/queries/list";
import { useQuery } from "@tanstack/react-query";
import { memo, useMemo, useRef } from "react";
import { ScrollView, View } from "react-native";

import {
  selectActiveFilterCount,
  useCollectionFilterStore,
  type CollectionStatusType,
  type PlatformType,
} from "@repo/utils/store/useCollectionFilterStore";

import {
  getGameStatusOptions,
  Option,
  PLATFORM_OPTIONS,
} from "@repo/utils/lib/gameOptions";

const CollectionFilters = () => {
  const search = useCollectionFilterStore((s) => s.search);
  const platform = useCollectionFilterStore((s) => s.platform);
  const lists = useCollectionFilterStore((s) => s.lists);
  const status = useCollectionFilterStore((s) => s.status);
  const setSearch = useCollectionFilterStore((s) => s.setSearch);
  const setPlatform = useCollectionFilterStore((s) => s.setPlatform);
  const setStatus = useCollectionFilterStore((s) => s.setStatus);
  const setLists = useCollectionFilterStore((s) => s.setLists);
  const reset = useCollectionFilterStore((s) => s.reset);
  const activeCount = useCollectionFilterStore(selectActiveFilterCount);

  const platformSheetRef = useRef<BottomSheetModal>(null);
  const statusSheetRef = useRef<BottomSheetModal>(null);
  const listsSheetRef = useRef<BottomSheetModal>(null);

  const { data, isLoading, isError, error } = useQuery(
    listGetManyQueryOptions(api),
  );

  const listOptions = useMemo<Option<string>[]>(
    () => (data ?? []).map((l) => ({ value: l.id, label: l.name })),
    [data],
  );

  return (
    <View className="mb-3 gap-3">
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search collection..."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-2"
      >
        <Button
          size="sm"
          variant={platform.length ? "default" : "outline"}
          onPress={() => platformSheetRef.current?.present()}
        >
          <Text>Platform{platform.length ? ` (${platform.length})` : ""}</Text>
        </Button>

        <Button
          size="sm"
          variant={status.length ? "default" : "outline"}
          onPress={() => statusSheetRef.current?.present()}
        >
          <Text>Status{status.length ? ` (${status.length})` : ""}</Text>
        </Button>

        <Button
          size="sm"
          disabled={isLoading || isError}
          variant={lists.length ? "default" : "outline"}
          onPress={() => listsSheetRef.current?.present()}
        >
          <Text>Lists{lists.length ? ` (${lists.length})` : ""}</Text>
        </Button>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onPress={reset}
          >
            <Text>Clear</Text>
          </Button>
        )}
      </ScrollView>

      <MultiSelectBottomSheet
        title="Platform"
        options={PLATFORM_OPTIONS}
        value={platform}
        onChange={(v) => setPlatform(v as PlatformType[])}
        sheetRef={platformSheetRef}
      />

      <MultiSelectBottomSheet
        title="Status"
        options={getGameStatusOptions({ completions: 0, isDLC: true })}
        value={status}
        onChange={(v) => setStatus(v as CollectionStatusType[])}
        sheetRef={statusSheetRef}
      />

      <MultiSelectBottomSheet
        title="Lists"
        options={listOptions}
        value={lists}
        onChange={setLists}
        sheetRef={listsSheetRef}
      />
    </View>
  );
};

export default memo(CollectionFilters);
