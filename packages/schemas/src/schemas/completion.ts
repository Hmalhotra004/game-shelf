import z from "zod";
import { CompletionStatusValues, CompletionStyleValues } from "../enums";

export const completionStyleSchema = z.enum(CompletionStyleValues, {
  error: "Completion style is requried",
});

export const completionStatusSchema = z.enum(CompletionStatusValues, {
  error: "Status is required",
});
