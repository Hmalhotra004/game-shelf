// import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
// import { drizzle } from "drizzle-orm/sqlite-core";
// import * as schema from "@/schema";

// let dbInstance: any;

// export async function getDB() {
//   if (dbInstance) return dbInstance;

//   const sqlite3 = await sqlite3InitModule({
//     locateFile: () => "/sqlite3.wasm",
//   });

//   const sqlite = new sqlite3.oo1.OpfsDb("gameshelf.db");

//   dbInstance = drizzle(sqlite, { schema });

//   return dbInstance;
// }
