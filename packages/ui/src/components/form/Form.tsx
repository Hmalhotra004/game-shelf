import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Combobox, OptionType } from "@repo/ui/components/ui/combobox";
import { DateTimePicker } from "@repo/ui/components/ui/date-picker";
import { Input } from "@repo/ui/components/ui/input";
import MultipleSelector from "@repo/ui/components/ui/multiple-select";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { cn } from "@repo/ui/lib/utils";
import { type ClassValue } from "clsx";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { InputHTMLAttributes, ReactNode, useState } from "react";
import { DurationTimePicker } from "../ui/duration-time-picker";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@repo/ui/components/ui/field";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@repo/ui/components/ui/input-group";

type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = {
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"];
};

type FormBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FormControlProps<TFieldValues, TName, TTransformedValues> & {
  horizontal?: boolean;
  controlFirst?: boolean;
  children: (
    field: Parameters<
      ControllerProps<TFieldValues, TName, TTransformedValues>["render"]
    >[0]["field"] & {
      "aria-invalid": boolean;
      id: string;
    },
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
    ExtraProps & { disabled: boolean },
) => ReactNode;

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
  controlFirst,
  horizontal,
}: FormBaseProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const labelElement = (
          <>
            {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
            {description && <FieldDescription>{description}</FieldDescription>}
          </>
        );
        const control = children({
          ...field,
          id: field.name,
          "aria-invalid": fieldState.invalid,
        });
        const errorElem = fieldState.invalid && (
          <FieldError errors={[fieldState.error]} />
        );

        return (
          <Field
            data-invalid={fieldState.invalid}
            orientation={horizontal ? "horizontal" : undefined}
          >
            {controlFirst ? (
              <>
                {control}
                {label || description ? (
                  <FieldContent>
                    {labelElement}
                    {errorElem}
                  </FieldContent>
                ) : (
                  <>{errorElem}</>
                )}
              </>
            ) : (
              <>
                {(label || description) && (
                  <FieldContent>{labelElement}</FieldContent>
                )}
                {control}
                {errorElem}
              </>
            )}
          </Field>
        );
      }}
    />
  );
}

export const FormInput: FormControlFunc<{
  placeholder?: string;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  className?: ClassValue;
}> = ({
  disabled,
  placeholder,
  autoComplete = "off",
  type,
  className,
  ...props
}) => {
  return (
    <FormBase {...props}>
      {(field) => (
        <Input
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={cn(className)}
          {...field}
        />
      )}
    </FormBase>
  );
};

export const FormInputPassword: FormControlFunc<{
  placeholder?: string;
  outerElement?: ReactNode;
}> = ({ disabled, placeholder, outerElement, ...props }) => {
  const [show, setShow] = useState(false);

  return (
    <FormBase {...props}>
      {(field) => (
        <div className="flex flex-col gap-y-2">
          <InputGroup>
            <InputGroupInput
              type={show ? "text" : "password"}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />

            <InputGroupButton
              onClick={() => setShow((pv) => !pv)}
              className="mr-2"
            >
              {show ? (
                <EyeIcon className="text-gray-500 size-5" />
              ) : (
                <EyeOffIcon className="text-gray-500 size-5" />
              )}
            </InputGroupButton>
          </InputGroup>
          {outerElement && outerElement}
        </div>
      )}
    </FormBase>
  );
};

export const FormTextarea: FormControlFunc<{
  placeholder?: string;
  className?: ClassValue;
}> = ({ disabled, placeholder, className, ...props }) => {
  return (
    <FormBase {...props}>
      {(field) => (
        <Textarea
          {...field}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(className)}
        />
      )}
    </FormBase>
  );
};

export const FormDatePicker: FormControlFunc = ({ disabled, ...props }) => {
  return (
    <FormBase {...props}>
      {(field) => (
        <DateTimePicker
          disabled={disabled}
          granularity="day"
          {...field}
        />
      )}
    </FormBase>
  );
};

// export const FormTimePicker: FormControlFunc = ({ disabled, ...props }) => {
//   return (
//     <FormBase {...props}>
//       {(field) => (
//         <TimePicker
//           date={new Date(0, 0, 1, 0, 0, field.value)}
//           disabled={disabled}
//           onChange={(val) => {
//             if (val instanceof Date) {
//               const secs = convertDateToSeconds(val);
//               field.onChange(secs);
//             }
//           }}
//         />
//       )}
//     </FormBase>
//   );
// };

export const FormTimePicker: FormControlFunc<{ className?: ClassValue }> = ({
  disabled,
  className,
  ...props
}) => {
  return (
    <FormBase {...props}>
      {(field) => (
        <DurationTimePicker
          value={field.value}
          onChange={field.onChange}
          disabled={disabled}
          className={className}
        />
      )}
    </FormBase>
  );
};

export const FormSelect: FormControlFunc<{ children: ReactNode }> = ({
  children,
  disabled,
  ...props
}) => {
  return (
    <FormBase {...props}>
      {({ onChange, onBlur, ...field }) => (
        <Select
          {...field}
          onValueChange={onChange}
        >
          <SelectTrigger
            aria-invalid={field["aria-invalid"]}
            id={field.id}
            onBlur={onBlur}
            disabled={disabled}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
      )}
    </FormBase>
  );
};

export const FormComboBox: FormControlFunc<{
  options: OptionType[];
  placeholder: string;
}> = ({ options, disabled, placeholder, ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, value }) => (
        <Combobox
          options={options}
          value={value}
          disabled={disabled}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </FormBase>
  );
};

export const FormCheckbox: FormControlFunc = ({ disabled, ...props }) => {
  return (
    <FormBase
      {...props}
      horizontal
      controlFirst
    >
      {({ onChange, value, ...field }) => (
        <Checkbox
          {...field}
          checked={value}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      )}
    </FormBase>
  );
};

type MultiOption = { value: string; label: string };

export const FormMultiSelect: FormControlFunc<{
  options: MultiOption[];
  placeholder: string;
}> = ({ disabled, options, placeholder, ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, value, ...field }) => (
        <MultipleSelector
          value={value?.map((id: string) => {
            const list = options.find((x) => x.value === id);
            return list ?? { value: id, label: id };
          })}
          defaultOptions={options}
          placeholder={placeholder}
          hidePlaceholderWhenSelected
          disabled={disabled}
          emptyIndicator={
            <p className="text-center text-sm text-muted-foreground">
              no results found.
            </p>
          }
          onChange={(selectedOptions) => {
            onChange(selectedOptions.map((opt) => opt.value));
          }}
          {...field}
        />
      )}
    </FormBase>
  );
};
