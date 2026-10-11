import Header from "@/components/Header";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const FinishPlaythrough = () => {
  const { playthroughId } = useLocalSearchParams<{ playthroughId: string }>();

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={12}>
        <View className="flex-1"></View>
      </ScreenWrapper>
    </View>
  );
};

export default FinishPlaythrough;
