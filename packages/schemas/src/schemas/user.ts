import z from "zod";
import { providerSchema } from "./collection";

// export const UserAccountSchema = z.enum(, {
//   error: "User Account Type is requried",
// });

export const updateKeysSchema = z.object({
  id: z
    .string({ error: "UserId is required" })
    .trim()
    .min(1, { error: "Userid required" }),
  PSNAccountUserName: z.string().trim().optional(),
  steamId: z.string().trim().optional(),
});

export const unlinkAccountSchema = z.object({
  type: providerSchema.exclude(["Physical", "Epic"]),
});

export type UnlinkAccountSchemaType = z.infer<typeof unlinkAccountSchema>;
