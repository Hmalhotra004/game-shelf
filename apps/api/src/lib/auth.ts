import { ORIGINS } from "@/constants";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "./sendEmail";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: ORIGINS,
  advanced: {
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  user: {
    additionalFields: {
      steamId: {
        type: "string",
        required: false,
      },
      PSNAccountUserName: {
        type: "string",
        required: false,
      },
      PSNAccountId: {
        type: "string",
        required: false,
      },
      userAccountType: {
        type: ["User", "Admin"],
        required: true,
        defaultValue: "User",
      },
      isAdult: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    revokeSessionsOnPasswordReset: true,
  },
  plugins: [
    emailOTP({
      storeOTP: "encrypted",
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await sendEmail(
            email,
            "Login to your account by otp",
            `Your verification code is: ${otp}`,
          );
        } else if (type === "email-verification") {
          await sendEmail(
            email,
            "Verify your email address",
            `Your verification code is: ${otp}`,
          );
        } else {
          await sendEmail(
            email,
            "Verify email to reset password",
            `Your verification code is: ${otp}`,
          );
        }
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
