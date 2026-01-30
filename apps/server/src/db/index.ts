import * as relations from "@repo/schemas/db/relations";
import * as schema from "@repo/schemas/db/schema";

import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const isProd = process.env.NODE_ENV === "production";

const schemaWithRelations = {
  ...schema,
  ...relations,
};

type DB = ReturnType<typeof drizzleNode<typeof schemaWithRelations>>;

let db: DB;

if (isProd) {
  db = drizzleNeon(process.env.DATABASE_URL_NEON!, {
    schema: schemaWithRelations,
  });
} else {
  const pool =
    globalThis.pgPool ??
    new Pool({
      connectionString: process.env.DATABASE_URL_LOCAL!,
    });

  globalThis.pgPool ??= pool;

  db = drizzleNode(pool, {
    schema: schemaWithRelations,
  });
}

export { db };
