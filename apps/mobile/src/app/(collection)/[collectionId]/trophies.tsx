import Header from "@/components/Header";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { PlatformType, ProviderType } from "@repo/schemas/types/index";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import {
  collectionGetPSNTrophiesQueryOptions,
  collectionGetSteamAchievementsQueryOptions,
} from "@repo/utils/queries/collection";

export default function Trophies() {
  const { collectionId, platform, provider } = useLocalSearchParams<{
    collectionId: string;
    platform: PlatformType;
    provider: ProviderType;
  }>();

  const isPS = platform === "PS";
  const isSteam = platform === "PC" && provider === "Steam";

  const PSNTrophies = useQuery(
    collectionGetPSNTrophiesQueryOptions(api, collectionId, isPS),
  );

  const steamTrophies = useQuery(
    collectionGetSteamAchievementsQueryOptions(api, collectionId, isSteam),
  );

  const isLoading = PSNTrophies.isLoading || steamTrophies.isLoading;

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <View className="flex-1">
          <Text>Trophies</Text>
        </View>
      </ScreenWrapper>
    </View>
  );
}
