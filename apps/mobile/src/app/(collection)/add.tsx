import Header from "@/components/Header";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const AddCollection = () => {
  const { igdbId } = useLocalSearchParams<{ igdbId: string }>();

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <View className="flex-1"></View>
      </ScreenWrapper>
    </View>
  );
};

export default AddCollection;
