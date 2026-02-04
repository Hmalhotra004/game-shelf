import { createAuthClient } from "better-auth/react";
import { auth } from "../../../../apps/server/src/lib/auth";
import { BASEURL } from "../constants";

import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: BASEURL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient(), inferAdditionalFields<typeof auth>()],
});
