import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function Index() {
  return (
    <ScreenWrapper>
      <View className="flex-1 items-center justify-center">
        <Text>Home</Text>
      </View>
    </ScreenWrapper>
  );
}
