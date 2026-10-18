import AccountCard from "@/components/accounts/AccountCard";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { useSession } from "@/hooks/useSession";
import { api } from "@/lib/api";
import { getPSNProfileQueryOptions } from "@repo/utils/queries/psn";
import { getSteamProfileQueryOptions } from "@repo/utils/queries/steam";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, View } from "react-native";

const Accounts = () => {
  const { session } = useSession();

  const user = session?.user as
    { steamId?: string | null; PSNAccountId?: string | null } | undefined;

  const steamId = user?.steamId;
  const PSNAccountId = user?.PSNAccountId;

  const { data: steam, isLoading: isLoadingSteam } = useQuery(
    getSteamProfileQueryOptions(api, !!steamId),
  );
  const { data: psn, isLoading: isLoadingPSN } = useQuery(
    getPSNProfileQueryOptions(api, !!PSNAccountId),
  );

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={16}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-1">
            <Text className="text-2xl font-bold">Accounts</Text>
            <Text className="text-sm text-muted-foreground">
              Link your gaming accounts so GameShelf can sync your library,
              trophies and achievements.
            </Text>
          </View>

          <AccountCard
            title="Steam"
            platform="steam"
            isConnected={!!steamId}
            isLoading={!!steamId && isLoadingSteam}
            data={steam ?? null}
          />
          <AccountCard
            title="PlayStation"
            platform="playstation"
            isConnected={!!PSNAccountId}
            isLoading={!!PSNAccountId && isLoadingPSN}
            data={psn ?? null}
          />
          <AccountCard
            title="Epic Games"
            platform="epic"
            isConnected={false}
            isLoading={false}
            data={null}
            comingSoon
          />
          <AccountCard
            title="Xbox"
            platform="xbox"
            isConnected={false}
            isLoading={false}
            data={null}
            comingSoon
          />
        </ScrollView>
      </ScreenWrapper>
    </View>
  );
};

export default Accounts;
