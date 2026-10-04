import z from "zod";
import { ownershipTypeSchema } from "./index";

export const createDLCSchema = z
  .object({
    igdbId: z.number().int().min(1, { error: "id is required" }),
    name: z.string().trim().min(1, { error: "Name is required" }),
    amount: z.string().trim().nullable(),
    dateOfPurchase: z.string().trim().nullable(),
    image: z.url().trim().nullable(),
    coverImage: z.url().trim().nullable(),
    steamAppId: z.string().trim().nullable(),
    ownershipType: ownershipTypeSchema,
  })
  .refine((d) => d.ownershipType !== "Included" || !d.amount?.trim(), {
    path: ["amount"],
    error: "Included DLC can't have an amount",
  });
