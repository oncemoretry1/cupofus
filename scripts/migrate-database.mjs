import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NETLIFY_DB_URL;

if (!connectionString) {
  if (process.env.VERCEL) {
    throw new Error(
      "No database connection string is available in the Vercel build environment.",
    );
  }

  console.log("Database migration skipped: no connection string is configured.");
  process.exit(0);
}

if (connectionString === "[SENSITIVE]") {
  throw new Error(
    "Vercel returned a redacted database secret. Run this command inside a Vercel build instead of using `vercel env pull`.",
  );
}

const client = neon(connectionString);
const database = drizzle(client);

console.log("Applying Cup of Us database migrations...");
await migrate(database, {
  migrationsFolder: "./netlify/database/migrations",
});
console.log("Cup of Us database migrations applied.");
