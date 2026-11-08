import Header from "@/components/Header";
import OverviewTitles from "@/components/home/OverviewTitles";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={16}>
        <View className="flex-1">
          <OverviewTitles />
        </View>
      </ScreenWrapper>
    </View>
  );
}
