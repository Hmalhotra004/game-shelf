import z from "zod";
import { GameTypeValues, SyncTypeValues } from "../enums";

export const SyncTypeSchema = z.enum(SyncTypeValues, {
  error: "Sync Type is requried",
});

export const GameTypeSchema = z.enum(GameTypeValues, {
  error: "GameType is requried",
});
