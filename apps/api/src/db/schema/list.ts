import { v7 as uuidv7 } from "uuid";
import { collection, user } from "./index";

import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const list = pgTable(
  "list",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    name: text("name").notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("list_user_idx").on(table.userId)],
);

export const listItem = pgTable(
  "list_item",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    listId: uuid("list_id")
      .notNull()
      .references(() => list.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("list_item_list_idx").on(table.listId),
    index("list_item_collection_idx").on(table.collectionId),

    // enforce uniqueness → cannot add same game twice to same list
    unique("list_collection_unique").on(table.listId, table.collectionId),
  ],
);
