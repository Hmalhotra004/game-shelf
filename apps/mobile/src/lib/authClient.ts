import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "./utils";

export const authClient = createAuthClient({
  baseURL: `${BASE_URL}/api/auth`,
  plugins: [
    emailOTPClient(),
    expoClient({
      scheme: "game-shelf",
      storagePrefix: "game-shelf",
      storage: SecureStore,
    }),
  ],
});
