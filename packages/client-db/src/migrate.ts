import migrations from "./migrations";
import type { Database } from "./db";

export async function migrate(db: Database) {
  await db.run(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  const applied = await db.all<{ hash: string }[]>(
    `SELECT hash FROM __drizzle_migrations`,
  );

  const appliedHashes = new Set(applied.map((m) => m.hash));

  for (const migration of migrations) {
    if (appliedHashes.has(migration.hash)) continue;

    console.info("Running migration:", migration.hash);

    await db.run("BEGIN");
    try {
      for (const stmt of migration.sql) {
        await db.run(stmt);
      }

      await db.run(
        `INSERT INTO __drizzle_migrations (hash, created_at)
         VALUES (?, ?)`,
        [migration.hash, Date.now()],
      );

      await db.run("COMMIT");
    } catch (err) {
      await db.run("ROLLBACK");
      throw err;
    }
  }
}
