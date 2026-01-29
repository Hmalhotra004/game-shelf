import z from "zod";

export const loginSchema = z.object({
  email: z.email().min(1, { error: "Email is required" }).max(50),
  password: z.string().min(6, { error: "Minimum 6 Characters" }).max(50),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, { error: "name is required" }),
    email: z.email().min(1, { error: "Email is required" }).max(50),
    password: z.string().min(6, { error: "Minimum 6 Characters" }).max(50),
    confirmPassword: z
      .string()
      .min(6, { error: "Minimum 6 Characters" })
      .max(50),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
