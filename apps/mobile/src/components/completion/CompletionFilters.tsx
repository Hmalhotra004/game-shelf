import MultiSelectBottomSheet from "@/components/form/MultiSelectBottomSheet";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { CompletionStyleType, PlatformType } from "@repo/schemas/types/index";
import { listGetManyQueryOptions } from "@repo/utils/queries/list";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

import {
  selectActiveFilterCount,
  useCompletionFilterStore,
} from "@repo/utils/store/useCompletionFilterStore";

import {
  COMPLETION_STYLE_OPTIONS,
  Option,
  PLATFORM_OPTIONS,
} from "@repo/utils/lib/gameOptions";

const CompletionFilters = () => {
  const [searchKey, setSearchKey] = useState(0);

  const search = useCompletionFilterStore((s) => s.search);
  const platform = useCompletionFilterStore((s) => s.platform);
  const lists = useCompletionFilterStore((s) => s.lists);
  const style = useCompletionFilterStore((s) => s.style);
  const setSearch = useCompletionFilterStore((s) => s.setSearch);
  const setPlatform = useCompletionFilterStore((s) => s.setPlatform);
  const setStyle = useCompletionFilterStore((s) => s.setStyle);
  const setLists = useCompletionFilterStore((s) => s.setLists);
  const reset = useCompletionFilterStore((s) => s.reset);
  const activeCount = useCompletionFilterStore(selectActiveFilterCount);

  const platformSheetRef = useRef<BottomSheetModal>(null);
  const styleSheetRef = useRef<BottomSheetModal>(null);
  const listsSheetRef = useRef<BottomSheetModal>(null);

  const { data, isLoading, isError, error } = useQuery(
    listGetManyQueryOptions(api),
  );

  const listOptions = useMemo<Option<string>[]>(
    () => (data ?? []).map((l) => ({ value: l.id, label: l.name })),
    [data],
  );

  const handleClear = useCallback(() => {
    reset();
    setSearchKey((k) => k + 1);
  }, [reset]);

  return (
    <View className="mb-3 gap-3">
      <SearchBar
        key={searchKey}
        defaultValue={search}
        onDebouncedChange={setSearch}
        placeholder="Search completion..."
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
          variant={style.length ? "default" : "outline"}
          onPress={() => styleSheetRef.current?.present()}
        >
          <Text>Style{style.length ? ` (${style.length})` : ""}</Text>
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
            onPress={handleClear}
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
        options={COMPLETION_STYLE_OPTIONS}
        value={style}
        onChange={(v) => setStyle(v as CompletionStyleType[])}
        sheetRef={styleSheetRef}
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

export default memo(CompletionFilters);
