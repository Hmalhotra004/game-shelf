import z from "zod";
import {
  collectionStatusValues,
  ownershipTypeValues,
  platformValues,
  providerValues,
  psVersionValues,
} from "../enums";

import type { PlatformType, ProviderType } from "@repo/schemas/types/index";

export const platformSchema = z.enum(platformValues, {
  error: "Platform is requried",
});

export const providerSchema = z.enum(providerValues, {
  error: "Provider is requried",
});

export const statusSchema = z.enum(collectionStatusValues, {
  error: "Status is required",
});

export const ownershipTypeSchema = z.enum(ownershipTypeValues, {
  error: "OwnerShip is required",
});

export const PSVersionSchema = z.enum(psVersionValues, {
  error: "PS Version is required when platform is PS",
});

export const providerPlatformRefine = (obj: {
  platform: PlatformType;
  provider: ProviderType;
}) =>
  (obj.platform === "PS" && ["PSN", "Physical"].includes(obj.provider)) ||
  (obj.platform === "PC" && ["Steam", "Epic"].includes(obj.provider));

export const externalIdsSchema = z.object({
  steamAppId: z.string().nullable().optional(),
  npCommunicationId: z.string().nullable().optional(),
});

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

// types
export type ExternalIdsSchemaType = z.infer<typeof externalIdsSchema>;
export type UpdateImagesSchemaType = z.infer<typeof updateImagesSchema>;
