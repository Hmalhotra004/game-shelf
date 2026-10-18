import z from "zod";

export const linkPSNAccountSchema = z.object({
  PSNAccountId: z
    .string({ error: "AccountId is required" })
    .trim()
    .min(2, { error: "AccountId is required" }),
});

export type LinkPSNAccountSchemaType = z.infer<typeof linkPSNAccountSchema>;

// ------------------------------- Query Schema -------------------------------------------
export const searchByUsernamePSN = z.object({
  query: z
    .string({ error: "Username is required" })
    .trim()
    .min(2, { error: "Username is required" }),
});

// ------------------------------- Types -------------------------------------------

export type SearchByUsernamePSNSchemaType = z.infer<typeof searchByUsernamePSN>;
