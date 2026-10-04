import DatePicker from "@/components/DatePicker/DatePicker";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";

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
  const [tempValue, setTempValue] = useState(value);

  return (
    <Modal
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/80 px-6"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full rounded-2xl bg-background px-4 pt-2 pb-4"
        >
          <DatePicker
            value={tempValue}
            onChange={setTempValue}
          />

          <View className="flex-row justify-between mt-2 gap-2">
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
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DatePickerModal;
