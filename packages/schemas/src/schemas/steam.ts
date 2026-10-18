import z from "zod";

export const linkSteamAccountSchema = z.object({
  steamId: z
    .string({ error: "SteamId is requried" })
    .trim()
    .min(1, { error: "SteamId is requried" }),
});

export type LinkSteamAccountSchemaType = z.infer<typeof linkSteamAccountSchema>;
