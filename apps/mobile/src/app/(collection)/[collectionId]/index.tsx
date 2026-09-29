import Header from "@/components/Header";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <View className="flex-1"></View>
      </ScreenWrapper>
    </View>
  );
}
