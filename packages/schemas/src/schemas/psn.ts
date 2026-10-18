import z from "zod";

export const linkPSNAccountSchema = z.object({
  PSNAccountUserName: z.string().trim().nullable(),
});

export type LinkPSNAccountSchemaType = z.infer<typeof linkPSNAccountSchema>;
