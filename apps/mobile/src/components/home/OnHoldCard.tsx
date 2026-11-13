import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { handleError } from "@/lib/utils";
import { HomeOnHoldItem } from "@repo/schemas/types/homeStats";
import { betterTimeText } from "@repo/utils/lib/utils";
import { getHomeOnHoldQueryOptions } from "@repo/utils/queries/stats";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";

import {
  startPlaythroughMutationOptions,
  updatePlaythroughMutationOptions,
} from "@repo/utils/mutations/playthrough";

import {
  HomeGameRow,
  HomeSection,
  HomeSectionEmpty,
  HomeSectionLoading,
} from "./HomeSection";

const OnHoldCard = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, error } = useQuery(
    getHomeOnHoldQueryOptions(api),
  );

  // a playthrough that is On Hold goes back to Active
  const resumePlaythrough = useMutation(
    updatePlaythroughMutationOptions(api, queryClient, (err) =>
      handleError(err),
    ),
  );

  // a game/DLC that is On Hold has no playthrough to resume, so start one
  const startPlaythrough = useMutation(
    startPlaythroughMutationOptions(api, queryClient, (err) =>
      handleError(err),
    ),
  );

  const isPending = resumePlaythrough.isPending || startPlaythrough.isPending;

  const resume = (item: HomeOnHoldItem) => {
    if (item.source === "Playthrough") {
      resumePlaythrough.mutate({
        id: item.id,
        status: "Active",
        notes: item.notes,
      });
      return;
    }

    startPlaythrough.mutate({
      gameType: item.gameType,
      ...(item.gameType === "DLC"
        ? { dlcId: item.targetId }
        : { collectionId: item.targetId }),
    });
  };

  const open = (item: HomeOnHoldItem) => {
    // there is no single-playthrough screen, so playthroughs open their list
    if (item.source === "Playthrough") {
      router.navigate({ pathname: "/(tabs)/playthrough" });
      return;
    }

    // router.push({
    //   pathname: "/(collection)/[collectionId]",
    //   params: { collectionId: item.collectionId },
    // });
  };

  const subtitle = (item: HomeOnHoldItem) => {
    const parts = [
      item.parentName,
      `Untouched for ${formatDistanceToNow(new Date(item.lastPlayedAt))}`,
      item.totalSeconds > 0 ? betterTimeText(item.totalSeconds) : null,
    ];

    return parts.filter(Boolean).join(" · ");
  };

  return (
    <HomeSection title="On hold">
      {isLoading ? (
        <HomeSectionLoading />
      ) : isError ? (
        <ErrorState
          error={error}
          refetch={refetch}
        />
      ) : !data || data.items.length === 0 ? (
        <HomeSectionEmpty message="Nothing on hold." />
      ) : (
        <>
          {data.items.map((item) => (
            <HomeGameRow
              key={`${item.source}:${item.id}`}
              image={item.image}
              title={item.name}
              isDlc={item.gameType === "DLC"}
              subtitle={subtitle(item)}
              onPress={() => open(item)}
              right={
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isPending}
                  onPress={() => resume(item)}
                >
                  <Text className="text-xs font-semibold">Resume</Text>
                </Button>
              }
            />
          ))}

          {data.total > data.items.length && (
            <Text className="text-center text-xs text-muted-foreground">
              {data.total - data.items.length} more on hold
            </Text>
          )}
        </>
      )}
    </HomeSection>
  );
};

export default OnHoldCard;
