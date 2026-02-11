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
