import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { handleError } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { PickNextModeType } from "@repo/schemas/types/homeStats";
import { PICK_NEXT_MODES } from "@repo/utils/lib/stats";
import { startPlaythroughMutationOptions } from "@repo/utils/mutations/playthrough";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { useRouter } from "expo-router";
import { PlayIcon, ShuffleIcon } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import {
  getPickNextQueryOptions,
  StatsQueryKeys,
} from "@repo/utils/queries/stats";

import {
  HomeGameRow,
  HomeSection,
  HomeSectionEmpty,
  HomeSectionLoading,
} from "./HomeSection";

const PickNextCard = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useThemeStore((s) => s.theme);

  const [mode, setMode] = useState<PickNextModeType>("oldest");
  const [exclude, setExclude] = useState<string | undefined>();

  const { data, isLoading, isError, isFetching, refetch, error } = useQuery(
    getPickNextQueryOptions(api, exclude),
  );

  const startPlaythrough = useMutation(
    startPlaythroughMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => {
        // the started game is no longer a valid suggestion
        queryClient.invalidateQueries({
          queryKey: StatsQueryKeys.homePickNextAll(),
        });
        router.navigate({ pathname: "/(tabs)/playthrough" });
      },
    ),
  );

  const item = mode === "oldest" ? data?.oldest : data?.random;

  const shuffle = () => {
    setMode("random");
    setExclude(data?.random?.id);
  };

  const start = () => {
    if (!item) return;

    startPlaythrough.mutate({
      gameType: item.gameType,
      ...(item.gameType === "DLC"
        ? { dlcId: item.id }
        : { collectionId: item.id }),
    });
  };

  return (
    <HomeSection
      title="Pick next"
      right={
        <View className="flex-row gap-1">
          {PICK_NEXT_MODES.map((m) => (
            <Button
              key={m.value}
              size="sm"
              variant={mode === m.value ? "secondary" : "ghost"}
              className="h-8 px-3"
              onPress={() => setMode(m.value)}
            >
              <Text className="text-xs font-semibold">{m.label}</Text>
            </Button>
          ))}
        </View>
      }
    >
      {isLoading ? (
        <HomeSectionLoading rows={1} />
      ) : isError ? (
        <ErrorState
          error={error}
          refetch={refetch}
        />
      ) : !item ? (
        <HomeSectionEmpty message="No backlog games to pick from." />
      ) : (
        <View className="gap-3">
          <HomeGameRow
            image={item.image}
            title={item.name}
            isDlc={item.gameType === "DLC"}
            subtitle={`${item.parentName ? `${item.parentName} · ` : ""}${item.platform} · Since ${formatDate(item.addedAt, "PP")}`}
            onPress={() =>
              router.push({
                pathname: "/(collection)/[collectionId]",
                params: { collectionId: item.collectionId },
              })
            }
          />

          <View className="flex-row gap-2">
            <Button
              className="flex-1 flex-row gap-1.5"
              disabled={startPlaythrough.isPending}
              onPress={start}
            >
              <PlayIcon
                color={THEME[theme].primaryForeground}
                size={14}
              />
              <Text className="font-semibold text-primary-foreground">
                {startPlaythrough.isPending ? "Starting..." : "Start playing"}
              </Text>
            </Button>

            <Button
              variant="outline"
              size="icon"
              disabled={isFetching}
              onPress={shuffle}
            >
              <ShuffleIcon
                color={THEME[theme].foreground}
                size={18}
              />
            </Button>
          </View>
        </View>
      )}
    </HomeSection>
  );
};

export default PickNextCard;
