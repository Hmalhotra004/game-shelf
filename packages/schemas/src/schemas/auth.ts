import z from "zod";

export const loginSchema = z.object({
  email: z
    .email({ error: "Email is required" })
    .trim()
    .min(1, { error: "Email is required" })
    .max(50),

  password: z
    .string({ error: "Password is required" })
    .trim()
    .min(6, { error: "Minimum 6 Characters" })
    .max(50),
});

export const signupSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .trim()
      .min(1, { error: "name is required" }),

    email: z
      .email({ error: "Email is required" })
      .trim()
      .min(1, { error: "Email is required" })
      .max(50),

    password: z
      .string({ error: "Password is required" })
      .trim()
      .min(6, { error: "Minimum 6 Characters" })
      .max(50),

    confirmPassword: z
      .string({ error: "Confirm Password is required" })
      .trim()
      .min(6, { error: "Minimum 6 Characters" })
      .max(50),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  pin: z.string({ error: "OTP is required" }).trim().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export const emailSchema = z.object({
  email: z
    .email({ error: "Email is required" })
    .trim()
    .min(1, { error: "Email is required" }),
});

export type EmailSchemaType = z.infer<typeof emailSchema>;
