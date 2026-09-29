import TabBar from "@/components/Tabbar/TabBar";
import { useSession } from "@/hooks/useSession";
import { Redirect, Tabs } from "expo-router";

export default function TabsLayout() {
  const { session, isPending } = useSession();

  if (isPending) return null;

  if (!session) return <Redirect href={{ pathname: "/(auth)" }} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="collection" />
      <Tabs.Screen name="playthrough" />
      <Tabs.Screen name="completion" />
    </Tabs>
  );
}
