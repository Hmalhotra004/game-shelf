import z from "zod";

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
