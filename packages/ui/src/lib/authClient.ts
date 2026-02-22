import { createAuthClient } from "better-auth/react";
import { BASEURL } from "../constants";

import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";

interface AdditionalFields {
  user: {
    additionalFields: {
      steamId: {
        type: "string";
        required: false;
      };
      PSNAccountUserName: {
        type: "string";
        required: false;
      };
      PSNAccountId: {
        type: "string";
        required: false;
      };
      userAccountType: {
        type: ("User" | "Admin")[];
        required: true;
        defaultValue: string;
      };
      isAdult: {
        type: "boolean";
        required: true;
        defaultValue: false;
      };
    };
  };
}

export const authClient = createAuthClient({
  baseURL: `${BASEURL}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient(), inferAdditionalFields<AdditionalFields>()],
});
