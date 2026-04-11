import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: `http://192.168.0.103:8080/api/auth`,
  plugins: [
    expoClient({
      scheme: "game-shelf",
      storagePrefix: "game-shelf",
      storage: SecureStore,
    }),
  ],
});
