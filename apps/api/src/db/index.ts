import { isProd } from "@/lib/isProd";
import { Pool } from "pg";
import * as relations from "./relation";
import * as schema from "./schema/index";

import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";

const schemaWithRelations = {
  ...schema,
  ...relations,
};

type DB =
  | ReturnType<typeof drizzleNeon<typeof schemaWithRelations>>
  | ReturnType<typeof drizzleNode<typeof schemaWithRelations>>;

let db: DB;

if (isProd()) {
  db = drizzleNeon(process.env.DATABASE_URL_PROD!, {
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
