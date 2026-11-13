import Header from "@/components/Header";
import RecentActivityCard from "@/components/home/HomeActivity";
import OnHoldCard from "@/components/home/OnHoldCard";
import OverviewTitles from "@/components/home/OverviewTitles";
import PickNextCard from "@/components/home/PickNextCard";
import WeeklyPlaytimeChart from "@/components/home/WeeklyPlayTimeChart";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { ScrollView, View } from "react-native";

const HomePage = () => {
  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={16}>
        <ScrollView
          contentContainerClassName="gap-3 pb-24"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <OverviewTitles />

          <WeeklyPlaytimeChart />

          <RecentActivityCard />

          <OnHoldCard />

          <PickNextCard />
        </ScrollView>
      </ScreenWrapper>
    </View>
  );
};

export default HomePage;
