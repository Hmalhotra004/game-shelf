import z from "zod";
import { providerSchema } from "./collection";
import { GameTypeSchema } from "./index";

// export const UserAccountSchema = z.enum(, {
//   error: "User Account Type is requried",
// });

export const unlinkAccountSchema = z.object({
  type: providerSchema.exclude(["Physical"]),
});

// ------------------------------- Types -------------------------------------------

export type UnlinkAccountSchemaType = z.infer<typeof unlinkAccountSchema>;

// ------------------------------- Query Schema -------------------------------------------
export const gameBasicInfoQuerySchema = z.object({
  id: z.string({ error: "Id is required" }).min(1, { error: "id is required" }),
  gameType: GameTypeSchema,
});

export type GameBasicInfoQuerySchemaType = z.infer<
  typeof gameBasicInfoQuerySchema
>;
