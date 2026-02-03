import { PlatformType, ProviderType } from "@/types/collection";
import z from "zod";

import {
  ownershipType,
  platform,
  provider,
  PSVersion,
  status,
} from "@/db/schema";

export const platformSchema = z.enum(platform.enumValues, {
  error: "Platform is requried",
});

export const providerSchema = z.enum(provider.enumValues, {
  error: "Provider is requried",
});

export const statusSchema = z.enum(status.enumValues, {
  error: "Status is required",
});

export const ownershipTypeSchema = z.enum(ownershipType.enumValues, {
  error: "OwnerShip is required",
});

export const PSVersionSchema = z.enum(PSVersion.enumValues, {
  error: "PS Version is required when platform is PS",
});

export const providerPlatformRefine = (obj: {
  platform: PlatformType;
  provider: ProviderType;
}) =>
  (obj.platform === "PS" && ["PSN", "Physical"].includes(obj.provider)) ||
  (obj.platform === "PC" && ["Steam", "Epic"].includes(obj.provider));
