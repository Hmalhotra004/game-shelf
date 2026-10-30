import { sql } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { completionStyle, GameType, platform, PSVersion } from "./enums";
import { collection, dlc, user } from "./index";

import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const completion = pgTable(
  "completion",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    gameType: GameType("game_type").notNull().default("Game"),
    totalPlaytime: integer("total_playtime"),
    completedAt: timestamp("completed_at", { mode: "date" }),
    notes: text("notes"),

    completionStyle: completionStyle("completion_style")
      .notNull()
      .default("Story"),

    platform: platform("platform").notNull(),
    PSVersion: PSVersion("ps_version"),

    collectionId: uuid("collection_id").references(() => collection.id, {
      onDelete: "cascade",
    }),

    dlcId: uuid("dlc_id").references(() => dlc.id, {
      onDelete: "cascade",
    }),

    userId: uuid("user_id")
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

    check(
      "ps_version_only_for_ps",
      sql`
      (${table.platform} = 'PS' AND ${table.PSVersion} IS NOT NULL)
      OR
      (${table.platform} != 'PS' AND ${table.PSVersion} IS NULL)
      `,
    ),
  ],
);
