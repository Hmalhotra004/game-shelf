import { sql } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { collection, dlc } from "./collection";
import { GameType } from "./enums";
import { user } from "./user";

import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const casualSession = pgTable(
  "casual_session",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    gameType: GameType("game_type").notNull(),
    playDate: timestamp("play_date", { withTimezone: true }).notNull(),
    secondsPlayed: integer("seconds_played").notNull(),
    notes: text("notes"),

    collectionId: uuid("collection_id").references(() => collection.id, {
      onDelete: "cascade",
    }),
    dlcId: uuid("dlc_id").references(() => dlc.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("casual_session_collection_idx").on(t.collectionId),
    index("casual_session_dlc_idx").on(t.dlcId),
    index("casual_session_user_idx").on(t.userId),
    index("casual_session_play_date_idx").on(t.playDate),
    check(
      "casual_session_target_check",
      sql`(
        (${t.gameType} = 'Game' AND ${t.collectionId} IS NOT NULL AND ${t.dlcId} IS NULL)
        OR
        (${t.gameType} = 'DLC' AND ${t.dlcId} IS NOT NULL AND ${t.collectionId} IS NULL)
      )`,
    ),
    check("casual_session_seconds_check", sql`${t.secondsPlayed} > 0`),
  ],
);
