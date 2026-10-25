import { PlatformAccountType } from "@repo/schemas/types/index";
import { DEV_URL, GenericErrorMessage, PROD_URL } from "@repo/utils/constants";
import { capitalizeName } from "@repo/utils/lib/utils";
import { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import Toast, { ToastOptions } from "react-native-toast-message";
import { twMerge } from "tailwind-merge";
import Constants from "expo-constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

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

export const ACCOUNT_PLATFORM_IMAGE: Record<PlatformAccountType, number> = {
  steam: require("../../assets/steam-96.png"),
  playstation: require("../../assets/playstation-96.png"),
  epic: require("../../assets/epic-96.png"),
  xbox: require("../../assets/xbox-96.png"),
};

export const configScheme = Constants.expoConfig?.scheme;
export const scheme = Array.isArray(configScheme)
  ? configScheme[0]
  : (configScheme ?? "game-shelf");
