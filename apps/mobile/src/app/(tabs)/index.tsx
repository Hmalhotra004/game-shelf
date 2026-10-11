import Header from "@/components/Header";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <View className="flex-1 items-center justify-center">
          <Text>Stats Coming Soon!!</Text>
        </View>
      </ScreenWrapper>
    </View>
  );
}
