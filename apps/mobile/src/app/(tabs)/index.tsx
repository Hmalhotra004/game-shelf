import { authClient } from "@/lib/authClient";
import { useRouter } from "expo-router";
import { Button, View } from "react-native";

export default function Index() {
  const router = useRouter();

  const logout = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => router.replace("/(auth)/login") },
    });
  };

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
    </View>
  );
}
