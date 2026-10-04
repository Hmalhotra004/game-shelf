import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { DateTimePicker, Host } from "@expo/ui/jetpack-compose";

type Props = { value: Date; onChange: (date: Date) => void };

const DatePicker = ({ value, onChange }: Props) => {
  const theme = useThemeStore((s) => s.theme);

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
        elementColors={{ containerColor: THEME[theme].background }}
      />
    </Host>
  );
};

export default DatePicker;
