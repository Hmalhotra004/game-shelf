import { Button, type buttonVariants } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VariantProps } from "class-variance-authority";
import { useCallback, useRef } from "react";
import { View } from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

export const useConfirmSheet = (
  title: string,
  message: string,
  confirmText?: string,
  variant: VariantProps<typeof buttonVariants>["variant"] = "default",
): [() => React.JSX.Element, () => Promise<boolean>] => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  // Resolve at most once; later calls (e.g. onDismiss after a button press) are no-ops
  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      sheetRef.current?.present();
    });
  }, []);

  // useEffect(() => {
  //   if (!isOpen) return;

  //   const subscription = BackHandler.addEventListener(
  //     "hardwareBackPress",
  //     () => {
  //       sheetRef.current?.dismiss();
  //       return true;
  //     },
  //   );

  //   return () => subscription.remove();
  // }, [isOpen, sheetRef]);

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

  // Stable component identity so the sheet isn't remounted on parent re-renders
  const ConfirmationDialog = useCallback(
    () => (
      <BottomSheetModal
        ref={sheetRef}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        // Fires on swipe-down, backdrop tap, Android back, and programmatic dismiss
        onDismiss={() => settle(false)}
      >
        <BottomSheetView className="px-4 pb-8 pt-2 gap-4">
          <View className="gap-1">
            <Text className="text-lg font-semibold">{title}</Text>
            <Text className="text-muted-foreground">{message}</Text>
          </View>

          <View className="flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onPress={() => {
                settle(false);
                sheetRef.current?.dismiss();
              }}
            >
              <Text>Cancel</Text>
            </Button>

            <Button
              variant={variant}
              onPress={() => {
                settle(true);
                sheetRef.current?.dismiss();
              }}
            >
              <Text>{confirmText ?? "Confirm"}</Text>
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    ),
    [title, message, variant, renderBackdrop, settle],
  );

  return [ConfirmationDialog, confirm];
};
