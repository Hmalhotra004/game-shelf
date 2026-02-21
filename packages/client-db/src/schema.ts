import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export type GameType = "Game" | "DLC";
export type Platform = "PS" | "PC";
export type PSVersion = "PS4" | "PS5";
export type Provider = "PSN" | "Physical" | "Steam" | "Epic";
export type OwnershipType =
  | "Free"
  | "Gift"
  | "Bought"
  | "Rented"
  | "PS+"
  | "Steam Family"
  | "Game Pass";

export const collection = sqliteTable(
  "collection",
  {
    id: text("id").primaryKey().$defaultFn(nanoid),
    name: text("name").notNull(),

    dateOfPurchase: integer("date_of_purchase", {
      mode: "timestamp_ms",
    }).notNull(),

    amount: real("amount").notNull().default(0),

    platform: text("platform").$type<Platform>().notNull().default("PC"),

    provider: text("provider").$type<Provider>().notNull().default("Steam"),

    PSVersion: text("ps_version").$type<PSVersion>(),

    ownershipType: text("ownership_type")
      .$type<OwnershipType>()
      .notNull()
      .default("Bought"),

    userId: text("user_id").notNull(),
    // .references(() => user.id, { onDelete: "cascade" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),

    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    index("collection_id").on(t.id),
    index("collection_user_idx").on(t.userId),

    check(
      "provider_platform_check",
      sql`
      (${t.platform} = 'PS' AND ${t.provider} IN ('PSN', 'Physical'))
      OR
      (${t.platform} = 'PC' AND ${t.provider} IN ('Steam', 'Epic'))
    `,
    ),

    check(
      "ps_version_only_for_ps",
      sql`
      (${t.platform} = 'PS' AND ${t.PSVersion} IS NOT NULL)
      OR
      (${t.platform} != 'PS' AND ${t.PSVersion} IS NULL)
    `,
    ),
  ],
);
