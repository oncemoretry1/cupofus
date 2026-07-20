import fs from "node:fs";
import path from "node:path";

const file = path.resolve("netlify/database/migrations/0001_seed_catalog.sql");
const sql = fs.readFileSync(file, "utf8");
const bookSql = sql.split('INSERT INTO "media_pairings"')[0];
const mediaSql = sql.split('INSERT INTO "media_pairings"')[1]?.split('INSERT INTO "coffee_pairings"')[0] ?? "";

function parseTuple(line) {
  const source = line.trim().replace(/^\(/, "").replace(/\),?$/, "");
  const values = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === "'") {
      if (quoted && source[i + 1] === "'") { value += "'"; i += 1; continue; }
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) { values.push(value.trim()); value = ""; continue; }
    value += char;
  }
  values.push(value.trim());
  return values.map(item => item === "NULL" ? null : item);
}

const bookRows = bookSql.split("\n").filter(line => line.trim().startsWith("('")).map(parseTuple);
const mediaRows = mediaSql.split("\n").filter(line => line.trim().startsWith("('")).map(parseTuple);
const errors = [];
const seen = new Set();
const isUsefulUrl = value => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.pathname !== "/";
  } catch { return false; }
};

for (const row of bookRows) {
  if (row.length !== 16) { errors.push(`book row has ${row.length} columns: ${row[0]}`); continue; }
  const [slug,title,thaiTitle,author,,summary,tags,concerns,personality,,audio,podcast,...stores] = row;
  if (seen.has(slug)) errors.push(`duplicate slug: ${slug}`);
  seen.add(slug);
  for (const [name,value] of Object.entries({title,thaiTitle,author,summary,tags,concerns,personality})) if (!value) errors.push(`${slug}: missing ${name}`);
  if (!isUsefulUrl(podcast)) errors.push(`${slug}: podcast link is missing or generic`);
  if (!stores.some(isUsefulUrl)) errors.push(`${slug}: no title-specific retailer link`);
}

const mediaSlugs = new Set(mediaRows.map(row => row[0]));
for (const slug of seen) if (!mediaSlugs.has(slug)) errors.push(`${slug}: missing song/movie pairing`);

const report = {
  books: bookRows.length,
  uniqueBooks: seen.size,
  mediaPairings: mediaRows.length,
  podcastCoverage: `${bookRows.filter(row => isUsefulUrl(row[11])).length}/${bookRows.length}`,
  audiobookSourceLinks: `${bookRows.filter(row => isUsefulUrl(row[10])).length}/${bookRows.length}`,
  audiobookRuntimeFallbacks: bookRows.filter(row => !isUsefulUrl(row[10])).length,
  retailerCoverage: `${bookRows.filter(row => row.slice(12).some(isUsefulUrl)).length}/${bookRows.length}`,
  errors: errors.length,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) {
  console.error(`\nErrors (${errors.length})\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
}
