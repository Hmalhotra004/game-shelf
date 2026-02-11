import z from "zod";
import { gameTypeValues, syncTypeValues } from "../enums";

export const SyncTypeSchema = z.enum(syncTypeValues, {
  error: "Sync Type is requried",
});

export const GameTypeSchema = z.enum(gameTypeValues, {
  error: "GameType is requried",
});
