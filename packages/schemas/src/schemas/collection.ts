import z from "zod";
import { PlatformEnum } from "../enums";

import type {
  PlatformType,
  ProviderType,
} from "@repo/schemas/types/collection";

export const platformSchema = z.enum(
  Object.values(PlatformEnum) as [PlatformEnum, ...PlatformEnum[]],
  {
    error: "Platform is requried",
  },
);

export const providerSchema = z.enum(["PSN", "Physical", "Steam", "Epic"], {
  error: "Provider is requried",
});

export const statusSchema = z.enum(
  [
    "Online",
    "Backlog",
    "Playing",
    "On Hold",
    "Dropped",
    "Story Completed",
    "Platinum",
    "Platinum+",
    "100% Completed",
  ],
  {
    error: "Status is required",
  },
);

export const ownershipTypeSchema = z.enum(
  ["Free", "Gift", "Bought", "Rented", "PS+", "Steam Family", "Game Pass"],
  {
    error: "OwnerShip is required",
  },
);

export const PSVersionSchema = z.enum(["PS4", "PS5"], {
  error: "PS Version is required when platform is PS",
});

export const providerPlatformRefine = (obj: {
  platform: PlatformType;
  provider: ProviderType;
}) =>
  (obj.platform === "PS" && ["PSN", "Physical"].includes(obj.provider)) ||
  (obj.platform === "PC" && ["Steam", "Epic"].includes(obj.provider));
