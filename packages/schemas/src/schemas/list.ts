import z from "zod";

export const createListSchema = z.object({
  name: z
    .string({ error: "Name is requried" })
    .trim()
    .min(1, { error: "Name is requried" }),
});

export const updateListSchema = z.object({
  name: z
    .string({ error: "Name cannot be empty" })
    .trim()
    .min(1, { error: "Name cannot be empty" }),
});

export const createListItemSchema = z.object({
  collectionId: z
    .string({ error: "Game is requried" })
    .trim()
    .min(1, { error: "Game is requried" }),
});

// types
export type createListSchemaType = z.infer<typeof createListSchema>;
export type updateListSchemaType = z.infer<typeof updateListSchema>;
export type createListItemSchemaType = z.infer<typeof createListItemSchema>;
