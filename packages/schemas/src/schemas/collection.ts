import z from "zod";
import type { PlatformType, ProviderType } from "../types/index";
import { createDLCSchema } from "./dlc";
import { ownershipTypeSchema } from "./index";

import {
  CollectionStatusValues,
  PlatformValues,
  ProviderValues,
  PSVersionValues,
} from "../enums";

export const platformSchema = z.enum(PlatformValues, {
  error: "Platform is requried",
});

export const providerSchema = z.enum(ProviderValues, {
  error: "Provider is requried",
});

export const statusSchema = z.enum(CollectionStatusValues, {
  error: "Status is required",
});

export const PSVersionSchema = z.enum(PSVersionValues, {
  error: "PS Version is required when platform is PS",
});

export const providerPlatformRefine = (obj: {
  platform: PlatformType;
  provider: ProviderType;
}) =>
  (obj.platform === "PS" && ["PSN", "Physical"].includes(obj.provider)) ||
  (obj.platform === "PC" && ["Steam", "Epic"].includes(obj.provider)) ||
  (obj.platform === "XBOX" && ["XBOX", "Physical"].includes(obj.provider));

export const externalIdsSchema = z.object({
  steamAppId: z.string().nullable().optional(),
  npCommunicationId: z.string().nullable().optional(),
});

export const createCollectionSchema = z
  .object({
    igdbId: z.number().int().min(1, { error: "id is required" }),
    name: z.string().trim().min(1, { error: "Name is requried" }),
    dateOfPurchase: z.string().trim().nullable(),
    edition: z.string().trim().nullable(),
    amount: z.string().trim().nullable(),
    platform: platformSchema,
    provider: providerSchema,
    PSVersion: z.array(PSVersionSchema),
    ownershipType: ownershipTypeSchema,
    image: z.url().trim().nullable(),
    coverImage: z.url().trim().nullable(),
    steamAppId: z.string().trim().nullable(),
    lists: z.array(z.string().trim()).nullable(),
    isDLC: z.boolean().default(false).optional(),
    collectionId: z.string().trim().optional(),
    DLCs: z.array(createDLCSchema).optional(),
  })
  .refine(
    (data) =>
      providerPlatformRefine({
        platform: data.platform,
        provider: data.provider,
      }),
    { error: "Invalid provider for this platform", path: ["provider"] },
  )
  .refine(
    (data) => {
      if (data.isDLC) {
        return !!data.collectionId && data.collectionId.trim().length > 0;
      }
      return true;
    },
    {
      path: ["collectionId"],
      error: "Parent Game is required when the item is a DLC",
    },
  )
  .refine(
    (data) => {
      if (data.platform === "PS") {
        return data.PSVersion.length >= 1;
      }
      return true;
    },
    {
      path: ["PSVersion"],
      error: "PS Version is required when platform is PS",
    },
  );

const steamGridDbImageUrl = (type: "grid" | "hero") =>
  z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .refine(
      (url) => {
        if (!url) return true;
        try {
          const { protocol, hostname, pathname } = new URL(url);
          return (
            protocol === "https:" &&
            hostname === "cdn2.steamgriddb.com" &&
            new RegExp(
              `^\\/${type}\\/[a-f0-9]{32}\\.(png|jpg|jpeg|webp)$`,
            ).test(pathname)
          );
        } catch {
          return false;
        }
      },
      {
        message: `Only SteamGridDB ${type} images (png, jpg, jpeg, webp) are allowed`,
      },
    )
    .nullable()
    .optional();

export const updateImagesSchema = z.object({
  customImage: steamGridDbImageUrl("grid"),
  customCoverImage: steamGridDbImageUrl("hero"),
});

// ------------------------------- Types -------------------------------------------
export type ExternalIdsSchemaType = z.infer<typeof externalIdsSchema>;
export type UpdateImagesSchemaType = z.infer<typeof updateImagesSchema>;
export type CreateCollectionSchemaType = z.infer<typeof createCollectionSchema>;

// ------------------------------- Query Schema -------------------------------------------
export const collectionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  platform: z.array(platformSchema).optional(),
  status: z.array(statusSchema).optional(),
  lists: z.array(z.string()).optional(),
});

// ------------------------------- Types -------------------------------------------
export type collectionListQuerySchemaInput = z.input<
  typeof collectionListQuerySchema
>;
export type CollectionListQuerySchemaType = z.infer<
  typeof collectionListQuerySchema
>;
