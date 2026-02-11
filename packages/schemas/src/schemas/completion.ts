import z from "zod";
import { completionStyleValues } from "../enums";

export const completionStyleSchema = z.enum(completionStyleValues, {
  error: "Completion style is requried",
});

export const completionStatusSchema = z.enum([
  "Story Completed",
  "Platinum",
  "Platinum+",
  "100% Completed",
] as const);
