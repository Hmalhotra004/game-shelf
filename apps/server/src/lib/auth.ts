import * as schema from "@repo/schemas/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "../db/index";
import { sendEmail } from "./sendEmail";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  trustedOrigins: ORIGINS,
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
