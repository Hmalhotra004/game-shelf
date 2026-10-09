import SearchBottomSheet from "@/components/collection/search/SearchBottomSheet";
import StartPlaythroughSheet from "@/components/playthrough/StartPlaythroughSheet";
import TabBar from "@/components/Tabbar/TabBar";
import { useSession } from "@/hooks/useSession";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Redirect, Tabs } from "expo-router";
import { RefObject, useRef } from "react";

export default function TabsLayout() {
  const { session, isPending } = useSession();

  const searchRef = useRef<BottomSheetModal>(null);
  const playthroughRef = useRef<BottomSheetModal>(null);
  const completionRef = useRef<BottomSheetModal>(null);

  if (isPending) return null;

  if (!session) return <Redirect href={{ pathname: "/(auth)" }} />;

  const SHEETS: Record<string, RefObject<BottomSheetModal | null>> = {
    index: searchRef,
    collection: searchRef,
    playthrough: playthroughRef,
    completion: completionRef,
  };

  const handleAdd = (routeName: string) => {
    SHEETS[routeName]?.current?.present();
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => (
          <TabBar
            {...props}
            onAddPress={handleAdd}
          />
        )}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="collection" />
        <Tabs.Screen name="playthrough" />
        <Tabs.Screen name="completion" />
      </Tabs>

      <SearchBottomSheet sheetRef={searchRef} />
      <StartPlaythroughSheet sheetRef={playthroughRef} />
    </>
  );
}
