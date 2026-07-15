import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("landing and brew experience keep the seven-cup contract", async () => {
  const page = await read("app/page.tsx");
  const cups = page.match(/name:\s*"Cup of /g) ?? [];
  const questionBlock = page.slice(page.indexOf("const brewQuestions"), page.indexOf("export default"));
  const questions = questionBlock.match(/label:\s*"/g) ?? [];
  const options = questionBlock.match(/options:\s*\[/g) ?? [];

  assert.equal(cups.length, 7);
  assert.equal(questions.length, 7);
  assert.equal(options.length, 7);
  assert.match(page, /\/ 07/);
  assert.match(page, /\/7 INGREDIENTS/);
  assert.match(page, /\/api\/recommend/);
});

test("database ships fifty books and fifty media pairings", async () => {
  const [initial, collection, pairings] = await Promise.all([
    read("drizzle/0000_slow_gauntlet.sql"),
    read("drizzle/0001_fifty_book_collection.sql"),
    read("drizzle/0002_media_pairings.sql"),
  ]);
  const initialBooks = initial.split("INSERT INTO `books`")[1].match(/\('[a-z0-9-]+'/g) ?? [];
  const addedBooks = collection.match(/\('[a-z0-9-]+'/g) ?? [];
  const mediaRows = pairings.match(/\('[a-z0-9-]+'/g) ?? [];

  assert.equal(initialBooks.length + addedBooks.length, 50);
  assert.equal(mediaRows.length, 50);
});

test("every book has a real café drink pairing", async () => {
  const coffeeSql = await read("drizzle/0003_coffee_pairings.sql");
  const pairings = coffeeSql.match(/^\('[^']+'/gm) ?? [];
  assert.equal(pairings.length, 50);
  assert.match(coffeeSql, /order_tip/);
  assert.match(coffeeSql, /Honey Americano/);
  assert.match(coffeeSql, /Hot Americano/);
});

test("each detail page exposes read, listen, watch and book-specific buying", async () => {
  const [detail, reader, externalBooks] = await Promise.all([
    read("app/cup/[slug]/page.tsx"),
    read("app/read/[slug]/page.tsx"),
    read("app/api/external/books/route.ts"),
  ]);

  assert.match(detail, /id="read"/);
  assert.match(detail, /id="listen"/);
  assert.match(detail, /id="watch"/);
  assert.match(detail, /id="buy"/);
  assert.match(detail, /encodeURIComponent\(`\$\{book\.title\} \$\{book\.author\}`\)/);
  assert.match(reader, /reader-directory/);
  assert.match(reader, /ค้นหา \{book\.title\} บน Google Books/);
  assert.match(externalBooks, /fallbackUrl/);
});
