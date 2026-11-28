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

export const casualSessionTimeSchema = z.object({
  playDate: createCasualSessionSchema.shape.playDate,
  secondsPlayed: createCasualSessionSchema.shape.secondsPlayed,
});

export type CasualSessionTimeSchemaType = z.infer<
  typeof casualSessionTimeSchema
>;

export type CreateCasualSessionSchemaType = z.infer<
  typeof createCasualSessionSchema
>;

export type UpdateCasualSessionSchemaType = z.infer<
  typeof updateCasualSessionSchema
>;

// ------------------------------- Query Schema -------------------------------------------
export const casualSessionListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    gameType: GameTypeSchema,
    collectionId: z.uuidv7().trim().optional(),
    dlcId: z.uuidv7().trim().optional(),
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

export type CasualSessionListQuerySchemaType = z.infer<
  typeof casualSessionListQuerySchema
>;
