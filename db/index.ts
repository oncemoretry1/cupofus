import { getConnectionString } from "@netlify/database";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!database) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.NETLIFY_DB_URL ||
      getConnectionString();
    database = drizzle(neon(connectionString), { schema });
  }
  return database;
}
