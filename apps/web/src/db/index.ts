import * as schema from "@repo/client-db/schema";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { drizzle } from "drizzle-orm/sqlite-proxy";

import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";

type Database = SqliteRemoteDatabase<typeof schema>;

let dbInstance: Database | null = null;
let dbInitPromise: Promise<Database> | null = null;

export async function getDB(): Promise<Database> {
  if (dbInstance) return dbInstance;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      const sqlite3 = await sqlite3InitModule();

      // Check if OPFS is available
      let db: any;
      if (sqlite3.opfs) {
        // Use OPFS-based database (persistent)
        db = await sqlite3.opfs.OpfsDb.create("gameshelf.db");
      } else {
        // Fallback to in-memory database
        console.warn("OPFS not available, using in-memory database");
        db = new sqlite3.oo1.DB();
      }

      // Create proxy adapter
      dbInstance = drizzle(
        async (sql, params, method) => {
          try {
            if (method === "run") {
              db.exec({
                sql,
                bind: params || [],
              });
              return { rows: [] };
            } else if (method === "all" || method === "get") {
              const result: any[] = [];
              db.exec({
                sql,
                bind: params || [],
                rowMode: "object",
                callback: (row: any) => {
                  result.push(row);
                },
              });

              if (method === "get") {
                return { rows: result.length > 0 ? [result[0]] : [] };
              }
              return { rows: result };
            }
            return { rows: [] };
          } catch (error) {
            console.error("SQL Error:", sql, params, error);
            throw error;
          }
        },
        { schema },
      );

      return dbInstance;
    } catch (error) {
      dbInitPromise = null;
      console.error("Database initialization error:", error);
      throw new Error(`Failed to initialize database: ${error}`);
    }
  })();

  return dbInitPromise;
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance = null;
    dbInitPromise = null;
  }
}
