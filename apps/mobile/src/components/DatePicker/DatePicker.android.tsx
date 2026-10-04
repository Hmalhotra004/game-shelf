import { DateTimePicker, Host } from "@expo/ui/jetpack-compose";

type Props = { value: Date; onChange: (date: Date) => void };

const DatePicker = ({ value, onChange }: Props) => {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: "100%" }}
    >
      <DateTimePicker
        onDateSelected={onChange}
        displayedComponents="date"
        initialDate={value.toISOString()}
        variant="picker"
      />
    </Host>
  );
};

export default DatePicker;
