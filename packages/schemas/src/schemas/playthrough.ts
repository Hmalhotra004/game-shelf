import z from "zod";
import { playthroughStatusValues } from "../enums";

export const playthroughStatusSchema = z.enum(playthroughStatusValues, {
  error: "playthroughStatus is requried",
});
