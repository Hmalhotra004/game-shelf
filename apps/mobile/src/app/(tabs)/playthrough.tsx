import Header from "@/components/Header";
import PlaythroughFilters from "@/components/playthrough/PlaythroughFilters";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { useDebounce } from "@repo/utils/hooks/useDebounce";
import { usePlaythroughFilterStore } from "@repo/utils/store/usePlaythroughFilterStore";
import { useMemo } from "react";
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

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={12}>
        <View className="flex-1">
          <PlaythroughFilters />
        </View>
      </ScreenWrapper>
    </View>
  );
};

export default Playthrough;
