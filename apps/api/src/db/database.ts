import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.js";

export function connect(url: string) {
  const client = postgres(url, { onnotice: () => {}, connect_timeout: 10 });
  return { client, db: drizzle(client, { schema }) };
}
export type Database = ReturnType<typeof connect>["db"];
export const migrateDatabase = (db: Database) => migrate(db, { migrationsFolder: fileURLToPath(new URL("../../drizzle", import.meta.url)) });
