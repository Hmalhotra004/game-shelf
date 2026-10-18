import Header from "@/components/Header";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

const Lists = () => {
  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <View className="flex-1 gap-6">
          <Text>Coming Soon</Text>
        </View>
      </ScreenWrapper>
    </View>
  );
};

export default Lists;
