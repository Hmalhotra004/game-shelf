import { ErrorState } from "@/components/ErrorState";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { HOME_ACTIVITY_KIND_LABEL } from "@repo/utils/lib/stats";
import { getHomeActivityQueryOptions } from "@repo/utils/queries/stats";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import {
  HomeGameRow,
  HomeSection,
  HomeSectionEmpty,
  HomeSectionLoading,
} from "./HomeSection";

const RecentActivityCard = () => {
  const { data, isLoading, isError, refetch, error } = useQuery(
    getHomeActivityQueryOptions(api),
  );

  // const router = useRouter();

  return (
    <HomeSection title="Recent activity">
      {isLoading ? (
        <HomeSectionLoading />
      ) : isError ? (
        <ErrorState
          error={error}
          refetch={refetch}
        />
      ) : !data || data.items.length === 0 ? (
        <HomeSectionEmpty message="Nothing here yet. Add a game to get started." />
      ) : (
        data.items.map((item) => (
          <HomeGameRow
            key={item.id}
            image={item.image}
            title={item.name}
            isDlc={item.gameType === "DLC"}
            subtitle={
              item.parentName
                ? `${HOME_ACTIVITY_KIND_LABEL[item.kind]} · ${item.parentName}`
                : HOME_ACTIVITY_KIND_LABEL[item.kind]
            }
            // onPress={() =>
            //   router.push({
            //     pathname: "/(collection)/[collectionId]",
            //     params: { collectionId: item.collectionId },
            //   })
            // }
            right={
              <Text className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.occurredAt), {
                  addSuffix: true,
                })}
              </Text>
            }
          />
        ))
      )}
    </HomeSection>
  );
};

export default RecentActivityCard;
