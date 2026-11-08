import Header from "@/components/Header";
import OverviewTitles from "@/components/home/OverviewTitles";
import WeeklyPlaytimeChart from "@/components/home/WeeklyPlayTimeChart";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { ScrollView, View } from "react-native";

const HomePage = () => {
  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={16}>
        <ScrollView
          contentContainerClassName="gap-3"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <OverviewTitles />

          <WeeklyPlaytimeChart />
        </ScrollView>
      </ScreenWrapper>
    </View>
  );
};

export default HomePage;
