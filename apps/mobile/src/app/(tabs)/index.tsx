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
        <View className="">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <OverviewTitles />

            <WeeklyPlaytimeChart />
          </ScrollView>
        </View>
      </ScreenWrapper>
    </View>
  );
};

export default HomePage;
