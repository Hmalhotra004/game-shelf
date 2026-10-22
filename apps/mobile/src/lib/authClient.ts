import { expoClient } from "@better-auth/expo/client";
import { BASE_URL } from "@repo/utils/constants";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

import { emailOTPClient } from "better-auth/client/plugins";

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
