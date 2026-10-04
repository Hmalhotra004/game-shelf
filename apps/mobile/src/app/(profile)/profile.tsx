import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/authClient";
import { useRouter } from "expo-router";
import { View } from "react-native";

const Profile = () => {
  const router = useRouter();

  const logout = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => router.replace("/(auth)") },
    });
  };

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <View className="flex-1">
          <Button onPress={logout}>
            <Text>Logout</Text>
          </Button>
        </View>
      </ScreenWrapper>
    </View>
  );
};

export default Profile;
