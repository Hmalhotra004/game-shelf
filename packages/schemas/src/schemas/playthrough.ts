import z from "zod";
import { PlaythroughStatusValues } from "../enums";
import { GameTypeSchema } from "./index";

export const playthroughStatusSchema = z.enum(PlaythroughStatusValues, {
  error: "playthroughStatus is requried",
});

export const createPlaythroughSchema = z
  .object({
    collectionId: z.string().trim().optional(),
    dlcId: z.string().trim().optional(),
    gameType: GameTypeSchema,
  })
  .refine(
    (data) => {
      if (data.gameType === "Game") return !!data.collectionId;
      return true;
    },
    {
      message: "Game is required",
      path: ["collectionId"],
    },
  )
  .refine(
    (data) => {
      if (data.gameType === "DLC") return !!data.dlcId;
      return true;
    },
    {
      message: "DLC is required",
      path: ["dlcId"],
    },
  );

export const createPlaythroughSessionSchema = z.object({
  secondsPlayed: z
    .number({ error: "Time played is required" })
    .int({ message: "Invalid time format" })
    .positive({ message: "Time must be greater than 0 seconds" }),
  playDate: z
    .string({ error: "Date is required" })
    .min(1, { error: "Date is required" }),
});

export const updatePlaythroughSchema = z.object({
  status: playthroughStatusSchema,
});

export const updatePlaythroughNotesSchema = z.object({
  notes: z
    .string()
    .trim()
    .max(250, { error: "Character length exceeded" })
    .nullable(),
});

export const updatePlaythroughSessionSchema = z.object({
  secondsPlayed: z
    .number({ error: "Time played is required" })
    .int({ message: "Invalid time format" })
    .positive({ message: "Time must be greater than 0 seconds" }),
  playDate: z
    .string({ error: "Date is required" })
    .min(1, { error: "Date is required" }),
});

// types
export type CreatePlaythroughSchemaType = z.infer<
  typeof createPlaythroughSchema
>;

export type CreatePlaythroughSessionSchemaType = z.infer<
  typeof createPlaythroughSessionSchema
>;

export type UpdatePlaythroughSchemaType = z.infer<
  typeof updatePlaythroughSchema
>;

export type UpdatePlaythroughNotesSchemaType = z.infer<
  typeof updatePlaythroughNotesSchema
>;

export type UpdatePlaythroughSessionSchemaType = z.infer<
  typeof updatePlaythroughSessionSchema
>;
