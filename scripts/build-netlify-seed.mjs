import { readFile, writeFile } from "node:fs/promises";

const sources = [
  "drizzle/0000_slow_gauntlet.sql",
  "drizzle/0001_fifty_book_collection.sql",
  "drizzle/0002_media_pairings.sql",
  "drizzle/0003_coffee_pairings.sql",
  "drizzle/0004_refine_movie_pairings.sql",
];

const statements = [];
for (const source of sources) {
  const sql = await readFile(source, "utf8");
  for (const raw of sql.replaceAll("--> statement-breakpoint", "").split(";")) {
    const statement = raw.trim();
    if (!/^(INSERT|UPDATE)\s/i.test(statement)) continue;
    let postgres = statement
      .replace(/^INSERT OR IGNORE INTO/i, "INSERT INTO")
      .replaceAll("`", '"');
    if (/^INSERT\s/i.test(postgres)) postgres += "\nON CONFLICT DO NOTHING";
    statements.push(`${postgres};`);
  }
}

await writeFile(
  "netlify/database/migrations/0001_seed_catalog.sql",
  `-- Generated from the verified Cup of Us catalog. Do not edit by hand.\n\n${statements.join("\n\n")}\n`,
);
