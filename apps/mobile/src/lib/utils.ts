import { GenericErrorMessage } from "@repo/utils/constants";
import { capitalizeName } from "@repo/utils/lib/utils";
import { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import Toast, { ToastOptions } from "react-native-toast-message";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function showToast(
  type: ToastOptions["type"],
  text2: string,
  text1?: string,
) {
  Toast.show({
    type,
    text1: text1
      ? text1
      : capitalizeName(type === "info" ? "Warning" : (type as string)),
    text2,
  });
}

export function handleError(error: Error, text1?: string) {
  const message =
    isAxiosError(error) && error.response?.data.message
      ? error.response?.data.message
      : GenericErrorMessage;

  showToast("error", message, text1);
}
