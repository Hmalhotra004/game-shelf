import { z } from "zod";
import { GameTypeSchema } from "./index";
import { MAX_NOTES_CHARACTERS } from "./playthrough";

export const createCasualSessionSchema = z
  .object({
    collectionId: z.uuidv7().trim().optional(),
    dlcId: z.uuidv7().trim().optional(),
    gameType: GameTypeSchema,

    secondsPlayed: z
      .number({ error: "Time played is required" })
      .int({ message: "Invalid time format" })
      .positive({ message: "Time must be greater than 0 seconds" }),
    playDate: z
      .string({ error: "Date is required" })
      .min(1, { error: "Date is required" }),

    notes: z
      .string()
      .trim()
      .max(MAX_NOTES_CHARACTERS, { error: "Character length exceeded" })
      .nullable(),
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

export const updateCasualSessionSchema = z.object({
  secondsPlayed: z
    .number({ error: "Time played is required" })
    .int({ message: "Invalid time format" })
    .positive({ message: "Time must be greater than 0 seconds" }),
  playDate: z
    .string({ error: "Date is required" })
    .min(1, { error: "Date is required" }),

  notes: z
    .string()
    .trim()
    .max(MAX_NOTES_CHARACTERS, { error: "Character length exceeded" })
    .nullable(),
});

export type CreateCasualSessionSchemaType = z.infer<
  typeof createCasualSessionSchema
>;

export type UpdateCasualSessionSchemaType = z.infer<
  typeof updateCasualSessionSchema
>;
