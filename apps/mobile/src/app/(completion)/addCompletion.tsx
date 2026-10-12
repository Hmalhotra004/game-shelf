import Header from "@/components/Header";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { GameType } from "@repo/schemas/types/index";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const AddCompletion = () => {
  const { gameType, id } = useLocalSearchParams<{
    id: string;
    gameType: GameType;
  }>();

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={12}>
        <View className="flex-1"></View>
      </ScreenWrapper>
    </View>
  );
};

export default AddCompletion;
