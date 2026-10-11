import { Button, type buttonVariants } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { VariantProps } from "class-variance-authority";
import { useCallback, useRef, useSyncExternalStore } from "react";
import { View } from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

type Variant = VariantProps<typeof buttonVariants>["variant"];

export type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  variant?: Variant;
};

type Content = {
  title: string;
  message: string;
  confirmText?: string;
  variant: Variant;
};

export const useConfirmSheet = (
  title: string,
  message: string,
  confirmText?: string,
  variant: Variant = "default",
): [
  () => React.JSX.Element,
  (options?: ConfirmOptions) => Promise<boolean>,
] => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  // Defaults from the hook arguments (always the latest render's values)
  const defaultsRef = useRef<Content>({ title, message, confirmText, variant });
  defaultsRef.current = { title, message, confirmText, variant };

  // What the sheet is currently showing. Changed only by confirm(), which
  // then notifies the sheet directly, so it never depends on parent re-renders.
  const contentRef = useRef<Content>(defaultsRef.current);
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => contentRef.current, []);

  // Resolve at most once; later calls (e.g. onDismiss after a button press) are no-ops
  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback((options: ConfirmOptions = {}) => {
    const d = defaultsRef.current;

    contentRef.current = {
      title: options.title ?? d.title,
      message: options.message ?? d.message,
      confirmText: options.confirmText ?? d.confirmText,
      variant: options.variant ?? d.variant,
    };
    listenersRef.current.forEach((l) => l());

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      sheetRef.current?.present();
    });
  }, []);

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

  // Fully stable identity (no remounts); it subscribes to its own content
  // and theme, so nothing here needs to be a dependency.
  const ConfirmationDialog = useCallback(
    function ConfirmationDialog() {
      const theme = useThemeStore((s) => s.theme);
      const c = useSyncExternalStore(subscribe, getSnapshot);

      return (
        <BottomSheetModal
          ref={sheetRef}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          onDismiss={() => settle(false)}
          backgroundStyle={{ backgroundColor: THEME[theme].background }}
          handleIndicatorStyle={{
            backgroundColor: THEME[theme].mutedForeground,
          }}
        >
          <BottomSheetView className="px-4 pb-8 pt-2 gap-4">
            <View className="gap-1">
              <Text className="text-lg font-semibold">{c.title}</Text>
              <Text className="text-muted-foreground">{c.message}</Text>
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
                variant={c.variant}
                onPress={() => {
                  settle(true);
                  sheetRef.current?.dismiss();
                }}
              >
                <Text>{c.confirmText ?? "Confirm"}</Text>
              </Button>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      );
    },
    [renderBackdrop, settle, subscribe, getSnapshot],
  );

  return [ConfirmationDialog, confirm];
};
