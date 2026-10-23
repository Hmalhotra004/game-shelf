import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeStore } from "@/store/useThemeStore";
import { useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

type DatePickerModalProps = {
  value: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
};

const DatePickerModal = ({
  value,
  onConfirm,
  onClose,
}: DatePickerModalProps) => {
  const theme = useThemeStore((s) => s.theme);
  const [tempValue, setTempValue] = useState(value);

  // Keep latest callbacks without re-opening the Android dialog on re-render
  const onConfirmRef = useRef(onConfirm);
  const onCloseRef = useRef(onClose);
  onConfirmRef.current = onConfirm;
  onCloseRef.current = onClose;

  // Android: the native dialog is opened imperatively when this mounts
  useEffect(() => {
    if (Platform.OS !== "android") return;

    DateTimePickerAndroid.open({
      value,
      mode: "date",
      onChange: (event, date) => {
        if (event.type === "set" && date) {
          onConfirmRef.current(date);
        } else {
          onCloseRef.current();
        }
      },
    });

    return () => {
      DateTimePickerAndroid.dismiss("date");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (Platform.OS === "android") return null;

  // iOS: inline calendar inside a modal
  return (
    <Modal
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Pressable
          style={StyleSheet.absoluteFill}
          className="bg-black/80"
          onPress={onClose}
        />

        <View className="w-full rounded-2xl bg-background px-4 pt-2 pb-4">
          <DateTimePicker
            value={tempValue}
            mode="date"
            display="inline"
            themeVariant={theme}
            onChange={(_, d) => d && setTempValue(d)}
          />

          <View className="mt-2 flex-row justify-between gap-2">
            <Button
              variant="outline"
              onPress={onClose}
              className="flex-1"
            >
              <Text>Close</Text>
            </Button>

            <Button
              onPress={() => onConfirm(tempValue)}
              className="flex-1"
            >
              <Text>Done</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DatePickerModal;
