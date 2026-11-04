import { z } from "zod";

export const weekStatsQuerySchema = z.object({
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  offset: z.coerce.number().int().min(0).max(104).default(0),
});

export type WeekStatsQueryType = z.infer<typeof weekStatsQuerySchema>;
