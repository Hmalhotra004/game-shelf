import { createAuthClient } from "better-auth/react";
import { auth } from "../../../../apps/server/src/lib/auth";

import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient(), inferAdditionalFields<typeof auth>()],
});
