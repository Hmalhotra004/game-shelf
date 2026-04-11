import { api } from "@/lib/api";
import { authClient } from "@/lib/authClient";
import { getStatsQueryOptions } from "@repo/utils/queries/stats";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  const logout = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => router.replace("/(auth)/login") },
    });
  };

  const { data: stats, isLoading } = useQuery(getStatsQueryOptions(api));

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        onPress={logout}
        title="Logout"
      />

      {isLoading && <Text>Loadr</Text>}

      {!isLoading && stats && (
        <View>
          <Text>{JSON.stringify(stats.overview)}</Text>
        </View>
      )}
    </View>
  );
}
