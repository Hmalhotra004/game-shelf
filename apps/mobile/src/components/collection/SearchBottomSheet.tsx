import SearchBar from "@/components/SearchBar";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler } from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

interface Props {
  sheetRef: RefObject<BottomSheetModal | null>;
}

const SearchBottomSheet = ({ sheetRef }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (!isOpen) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        sheetRef.current?.dismiss();
        return true;
      },
    );

    return () => subscription.remove();
  }, [isOpen, sheetRef]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  const snapPoints = useMemo(() => ["90%"], []);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(index) => setIsOpen(index >= 0)}
      onDismiss={() => setIsOpen(false)}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: THEME[theme].background }}
      handleIndicatorStyle={{ backgroundColor: THEME[theme].mutedForeground }}
    >
      <BottomSheetView className="flex-1 px-4 pb-8">
        <SearchBar
          onChangeText={() => {}}
          value=""
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default SearchBottomSheet;
