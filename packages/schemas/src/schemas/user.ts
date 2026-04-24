import z from "zod";
import { providerSchema } from "./collection";

// export const UserAccountSchema = z.enum(, {
//   error: "User Account Type is requried",
// });

export const linkAccountSchema = z.object({
  PSNAccountUserName: z.string().trim().nullable(),
});

export const linkSteamAccountSchema = z.object({
  steamId: z
    .string({ error: "SteamId is requried" })
    .trim()
    .min(1, { error: "SteamId is requried" }),
});

export const unlinkAccountSchema = z.object({
  type: providerSchema.exclude(["Physical", "Epic"]),
});

export type LinkAccountSchemaType = z.infer<typeof linkAccountSchema>;
export type LinkSteamAccountSchemaType = z.infer<typeof linkSteamAccountSchema>;
export type UnlinkAccountSchemaType = z.infer<typeof unlinkAccountSchema>;
