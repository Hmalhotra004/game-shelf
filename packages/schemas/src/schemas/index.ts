import z from "zod";
import { GameTypeValues, OwnershipTypeValues, SyncTypeValues } from "../enums";

export const SyncTypeSchema = z.enum(SyncTypeValues, {
  error: "Sync Type is requried",
});

export const GameTypeSchema = z.enum(GameTypeValues, {
  error: "GameType is requried",
});

export const ownershipTypeSchema = z.enum(OwnershipTypeValues, {
  error: "OwnerShip is required",
});
