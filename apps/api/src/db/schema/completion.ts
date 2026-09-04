import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { completionStyle, GameType } from "./enums";
import { collection, dlc, user } from "./index";

import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const completion = pgTable(
  "completion",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    gameType: GameType("game_type").notNull().default("Game"),
    totalPlaytime: integer("total_playtime"),
    completedAt: timestamp("completed_at", { mode: "date" }),
    notes: text("notes"),

    completionStyle: completionStyle("completion_style")
      .notNull()
      .default("Story"),

    collectionId: text("collection_id").references(() => collection.id, {
      onDelete: "cascade",
    }),

    dlcId: text("dlc_id").references(() => dlc.id, {
      onDelete: "cascade",
    }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("completion_user_idx").on(table.userId),
    index("completion_collection_idx").on(table.collectionId),
    index("completion_dlc_idx").on(table.dlcId),

    check(
      "completion_game_or_dlc_check",
      sql`
        (${table.gameType} = 'Game' AND ${table.collectionId} IS NOT NULL AND ${table.dlcId} IS NULL)
        OR
        (${table.gameType} = 'DLC' AND ${table.dlcId} IS NOT NULL AND ${table.collectionId} IS NULL)
      `,
    ),
  ],
);
