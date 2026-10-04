import { DatePicker as DateTimePicker, Host } from "@expo/ui/swift-ui";

type Props = { value: Date; onChange: (date: Date) => void };

const DatePicker = ({ value, onChange }: Props) => {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: "100%" }}
    >
      <DateTimePicker
        selection={value}
        displayedComponents={["date"]}
        onDateChange={onChange}
      />
    </Host>
  );
};

export default DatePicker;
