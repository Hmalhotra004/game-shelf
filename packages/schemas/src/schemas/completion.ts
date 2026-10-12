import { MAX_NOTES_CHARACTERS } from "@repo/utils/constants";
import z from "zod";
import { CompletionStatusValues, CompletionStyleValues } from "../enums";
import { platformSchema } from "./collection";
import { GameTypeSchema } from "./index";

export const completionStyleSchema = z.enum(CompletionStyleValues, {
  error: "Completion style is requried",
});

export const completionStatusSchema = z.enum(CompletionStatusValues, {
  error: "Status is required",
});

export const createCompletionSchema = z
  .object({
    gameType: GameTypeSchema,
    completionStyle: completionStyleSchema,
    completionStatus: completionStatusSchema,

    totalPlaytime: z
      .number({ error: "Time played is required" })
      .int({ message: "Invalid time format" })
      .positive({ message: "Time must be greater than 0 seconds" }),

    completedAt: z.string().trim().nullable(),

    notes: z
      .string()
      .trim()
      .max(MAX_NOTES_CHARACTERS, { error: "Character length exceeded" })
      .nullable(),

    collectionId: z.string().trim().optional(),
    dlcId: z.string().trim().optional(),
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

export const updateCompletionSchema = z.object({
  completionStyle: completionStyleSchema,

  totalPlaytime: z
    .number({ error: "Time played is required" })
    .int({ message: "Invalid time format" })
    .positive({ message: "Time must be greater than 0 seconds" }),

  completedAt: z.string().trim().nullable(),

  notes: z
    .string()
    .trim()
    .max(MAX_NOTES_CHARACTERS, { error: "Character length exceeded" })
    .nullable(),
});

// types
export type CreateCompletionSchemaType = z.infer<typeof createCompletionSchema>;
export type UpdateCompletionSchemaType = z.infer<typeof updateCompletionSchema>;

// ------------------------------- Query Schema -------------------------------------------
export const gameInfoCompletionQuerySchema = z.object({
  id: z.string({ error: "Id is required" }).min(1, { error: "id is required" }),
  gameType: GameTypeSchema,
});

export const completionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  platform: z.array(platformSchema).optional(),
  style: z.array(completionStyleSchema).optional(),
  lists: z.array(z.string()).optional(),
});

// ------------------------------- Types -------------------------------------------
export type CompletionListQuerySchemaInput = z.input<
  typeof completionListQuerySchema
>;
export type CompletionListQuerySchemaType = z.infer<
  typeof completionListQuerySchema
>;
export type GameInfoCompletionQuerySchema = z.infer<
  typeof gameInfoCompletionQuerySchema
>;
