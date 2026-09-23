import { BASE_URL } from "@/lib/constants";
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: `${BASE_URL}/api/auth`,
  plugins: [
    expoClient({
      scheme: "game-shelf",
      storagePrefix: "game-shelf",
      storage: SecureStore,
    }),
  ],
});
