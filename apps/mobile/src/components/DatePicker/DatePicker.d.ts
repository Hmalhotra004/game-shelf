import type { ComponentType } from "react";

type DatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

declare const DatePicker: ComponentType<DatePickerProps>;
export default DatePicker;
