import z from "zod";
import {
  CollectionStatusValues,
  OwnershipTypeValues,
  PlatformValues,
  ProviderValues,
  PSVersionValues,
} from "../enums";

import type { PlatformType, ProviderType } from "@repo/schemas/types/index";

export const platformSchema = z.enum(PlatformValues, {
  error: "Platform is requried",
});

export const providerSchema = z.enum(ProviderValues, {
  error: "Provider is requried",
});

export const statusSchema = z.enum(CollectionStatusValues, {
  error: "Status is required",
});

export const ownershipTypeSchema = z.enum(OwnershipTypeValues, {
  error: "OwnerShip is required",
});

export const PSVersionSchema = z.enum(PSVersionValues, {
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
