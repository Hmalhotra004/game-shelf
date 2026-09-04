import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { PSVersion, ownershipType, platform, provider, status } from "./enums";
import { user } from "./user";

import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const collection = pgTable(
  "collection",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    name: text("name").notNull(),
    edition: text("edition"),
    dateOfPurchase: timestamp("date_of_purchase", { mode: "date" }),
    amount: numeric("amount", { precision: 10, scale: 2 }),

    image: text("image"),
    customImage: text("custom_image"),
    coverImage: text("cover_image"),
    customCoverImage: text("custom_cover_image"),

    ownershipType: ownershipType("ownership_type").notNull().default("Bought"),
    status: status("status").notNull().default("Backlog"),
    platform: platform("platform").notNull().default("PC"),
    provider: provider("provider").notNull().default("Steam"),
    PSVersion: PSVersion("ps_version"),

    completions: integer("completions").notNull().default(0),
    dlcCount: integer("dlc_count").notNull().default(0),
    archived: boolean("archived").notNull().default(false),

    igdbId: text("igdbId").notNull(),
    npCommunicationId: text("np_communication_id"),
    steamAppId: text("steam_app_id"),
    steamGridDBId: text("steam_grid_db_id"),

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
    index("collection_user_idx").on(table.userId),
    index("collection_platform_idx").on(table.platform),
    index("collection_provider_idx").on(table.provider),

    check(
      "provider_platform_check",
      sql`
      (${table.platform} = 'PS' AND ${table.provider} IN ('PSN', 'Physical'))
      OR
      (${table.platform} = 'PC' AND ${table.provider} IN ('Steam', 'Epic'))
      OR
      (${table.platform} = 'XBOX' AND ${table.provider} IN ('XBOX', 'Physical'))
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

    unique("user_steam_game_unique").on(
      table.userId,
      table.steamAppId,
      table.provider,
    ),
  ],
);

export const dlc = pgTable(
  "dlc",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    name: text("name").notNull(),
    dateOfPurchase: timestamp("date_of_purchase", { mode: "date" }),
    amount: numeric("amount", { precision: 10, scale: 2 }),

    image: text("image"),
    customImage: text("custom_image"),
    coverImage: text("cover_image"),
    customCoverImage: text("custom_cover_image"),

    ownershipType: ownershipType("ownership_type").notNull().default("Bought"),
    status: status("status").notNull().default("Backlog"),

    completions: integer("completions").notNull().default(0),
    archived: boolean("archived").notNull().default(false),

    igdbId: text("igdbId").notNull(),
    npCommunicationId: text("np_communication_id"),
    steamAppId: text("steam_app_id"),
    steamGridDBId: text("steam_grid_db_id"),

    collectionId: text("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
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
    index("dlc_collection_idx").on(table.collectionId),
    index("dlc_user_idx").on(table.userId),
  ],
);
