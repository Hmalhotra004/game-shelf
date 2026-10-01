import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input as TextInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import type { ClassValue } from "clsx";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import { ReactNode, useState } from "react";

import {
  KeyboardTypeOptions,
  StyleProp,
  TextInputProps,
  TextStyle,
  View,
} from "react-native";

import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

// ─── Core types ──────────────────────────────────────────────────────────────

type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = {
  name: TName;
  label?: string;
  description?: string;
  control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"];
};

type FormBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FormControlProps<TFieldValues, TName, TTransformedValues> & {
  /** Render the actual input; receives the bound field + invalid flag */
  children: (
    field: Parameters<
      ControllerProps<TFieldValues, TName, TTransformedValues>["render"]
    >[0]["field"] & { invalid: boolean },
  ) => ReactNode;
};

type FormControlFunc<
  ExtraProps extends Record<string, unknown> = Record<never, never>,
> = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(
  props: FormControlProps<TFieldValues, TName, TTransformedValues> &
    ExtraProps & { disabled?: boolean },
) => ReactNode;

// ─── FormBase ─────────────────────────────────────────────────────────────────

function FormBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  children,
  control,
  label,
  name,
  description,
}: FormBaseProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View className="gap-y-1.5">
          {label && (
            <Text className="text-sm font-medium text-foreground">{label}</Text>
          )}

          {description && (
            <Text className="text-xs text-muted-foreground">{description}</Text>
          )}

          {children({ ...field, invalid: fieldState.invalid })}

          {fieldState.invalid && fieldState.error?.message && (
            <Text className="text-xs text-destructive">
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

// ─── FormInput ────────────────────────────────────────────────────────────────

export const FormInput: FormControlFunc<{
  placeholder?: string;
  autoComplete?: TextInputProps["autoComplete"];
  keyboardType?: TextInputProps["keyboardType"];
  maxLength?: TextInputProps["maxLength"];
  autoFocus?: boolean;
  className?: ClassValue;
}> = ({
  disabled,
  placeholder,
  autoComplete,
  keyboardType,
  maxLength,
  className,
  autoFocus,
  ...props
}) => (
  <FormBase {...props}>
    {({ onChange, onBlur, value, invalid }) => (
      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={!disabled}
        autoFocus={autoFocus}
        className={cn(
          "h-10 rounded-md border border-border bg-card px-3 py-2",
          "text-sm text-foreground placeholder:text-muted-foreground",
          invalid && "border-destructive",
          disabled && "opacity-50",
          className,
        )}
      />
    )}
  </FormBase>
);

// ─── FormInputPassword ────────────────────────────────────────────────────────

export const FormInputPassword: FormControlFunc<{
  placeholder?: string;
  className?: ClassValue;
  autoFocus?: boolean;
}> = ({ disabled, placeholder, className, autoFocus, ...props }) => {
  const [show, setShow] = useState(false);
  const theme = useThemeStore((state) => state.theme);
  const iconColor = theme === "dark" ? "#ffffff" : "#000000";

  return (
    <FormBase {...props}>
      {({ onChange, onBlur, value, invalid }) => (
        <View
          className={cn(
            "flex-row h-10 items-center rounded-md border border-border bg-card w-full",
            invalid && "border-destructive",
            disabled && "opacity-50",
            className,
          )}
        >
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            secureTextEntry={!show}
            editable={!disabled}
            autoFocus={autoFocus}
            className={cn(
              "flex-1 text-sm text-foreground placeholder:text-muted-foreground border-0 bg-background",
              className,
            )}
          />

          <Button
            variant="ghost"
            onPress={() => setShow((v) => !v)}
            className="bg-background text-foreground rounded-full"
          >
            {show ? (
              <EyeIcon
                size={18}
                color={iconColor}
              />
            ) : (
              <EyeOffIcon
                size={18}
                color={iconColor}
              />
            )}
          </Button>
        </View>
      )}
    </FormBase>
  );
};

// ─── FormTextarea ─────────────────────────────────────────────────────────────

export const FormTextarea: FormControlFunc<{
  placeholder?: string;
  numberOfLines?: number;
  className?: ClassValue;
  keepDisabledStyle?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: TextInputProps["maxLength"];
  style?: StyleProp<TextStyle>;
}> = ({
  disabled,
  placeholder,
  numberOfLines = 4,
  keyboardType = "default",
  className,
  keepDisabledStyle,
  style,
  maxLength,
  ...props
}) => (
  <FormBase {...props}>
    {({ onChange, onBlur, value, invalid }) => (
      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        scrollEnabled={true}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline
        numberOfLines={numberOfLines}
        editable={!disabled}
        style={[{ maxHeight: 120, width: "100%", flexShrink: 1 }, style]}
        textAlignVertical="top"
        // disableOpacityWhenReadonly={keepDisabledStyle}
        className={cn(
          "min-h-[96px] rounded-md border border-border bg-card px-3 py-2",
          "text-sm text-foreground placeholder:text-muted-foreground",
          invalid && "border-destructive",
          disabled && !keepDisabledStyle && "opacity-50",
          className,
        )}
      />
    )}
  </FormBase>
);

// ─── FormSwitch  (checkbox equivalent on native) ──────────────────────────────

export const FormSwitch: FormControlFunc<{
  label: string; // required for switch — it IS the label
}> = ({ disabled, ...props }) => (
  <FormBase {...props}>
    {({ onChange, value }) => (
      <View className="flex-row items-center gap-x-3">
        <Switch
          checked={!!value}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      </View>
    )}
  </FormBase>
);

// ─── FormCheckbox ─────────────────────────────────────────────────────────────

export const FormCheckbox: FormControlFunc<{
  label: string;
  className?: ClassValue;
}> = ({ disabled, label, className, ...props }) => (
  <FormBase {...props}>
    {({ onChange, value }) => (
      <View className={cn("flex-row items-center gap-x-3", className)}>
        <Checkbox
          checked={!!value}
          onCheckedChange={onChange}
          disabled={disabled}
        />
        <Label
          onPress={() => !disabled && onChange(!value)}
          className="text-sm text-foreground"
        >
          {label}
        </Label>
      </View>
    )}
  </FormBase>
);

// ─── FormRadioGroup ───────────────────────────────────────────────────────────

// type RadioOption = { value: string; label: string };

// export const FormRadioGroup: FormControlFunc<{
//   options: RadioOption[];
//   className?: ClassValue;
// }> = ({ disabled, options, className, ...props }) => (
//   <FormBase {...props}>
//     {({ onChange, value }) => (
//       <RadioGroup
//         value={value}
//         onValueChange={disabled ? () => {} : onChange}
//         className={cn("gap-y-2", className)}
//       >
//         {options.map((opt) => (
//           <View
//             key={opt.value}
//             className="flex-row items-center gap-x-3"
//           >
//             <RadioGroupItem
//               value={opt.value}
//               aria-labelledby={`radio-label-${opt.value}`}
//               disabled={disabled}
//             />
//             <Label
//               nativeID={`radio-label-${opt.value}`}
//               onPress={() => !disabled && onChange(opt.value)}
//               className="text-sm text-foreground"
//             >
//               {opt.label}
//             </Label>
//           </View>
//         ))}
//       </RadioGroup>
//     )}
//   </FormBase>
// );
