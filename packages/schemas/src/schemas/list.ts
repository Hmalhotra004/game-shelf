import z from "zod";

export const createListSchema = z.object({
  name: z
    .string({ error: "Name is requried" })
    .trim()
    .min(1, { error: "Name is requried" }),
});
