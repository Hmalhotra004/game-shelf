import { createAuthClient } from "better-auth/react";
import { BASEURL } from "../constants";

import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: `${BASEURL}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    emailOTPClient(),
    // inferAdditionalFields<typeof auth>()
  ],
});
