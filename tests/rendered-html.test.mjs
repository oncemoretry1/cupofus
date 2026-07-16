import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("landing and brew experience keep the seven-cup contract", async () => {
  const [page,quiz] = await Promise.all([read("app/page.tsx"),read("lib/brew-quiz.ts")]);
  const cups = page.match(/name:\s*"Cup of /g) ?? [];
  const questions = quiz.match(/prompt:samePrompt\(/g) ?? [];
  const options = quiz.match(/\{id:"[^"]+",label:/g) ?? [];

  assert.equal(cups.length, 7);
  assert.equal(questions.length, 7);
  assert.equal(options.length, 35);
  assert.match(quiz, /morning/);
  assert.match(quiz, /afternoon/);
  assert.match(quiz, /evening/);
  assert.match(quiz, /night/);
  assert.match(page, /\/ 07/);
  assert.match(page, /\/7 INGREDIENTS/);
  assert.match(page, /\/api\/recommend/);
  assert.match(page, /cup-of-us-last-profile/);
  assert.match(page, /ไม่รู้จะอ่านอะไร/);
  assert.match(page, /ตอบคำถามสั้น ๆ/);
  assert.match(page, /เริ่มได้เลย ไม่ต้องล็อกอิน/);
  assert.match(page, /เริ่มชงแก้วของฉัน/);
  assert.match(page, /hook-process/);
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
  assert.match(detail, /encodeURIComponent\(`\$\{book\.title\} \$\{book\.author\} \$\{phrase\}`\)/);
  assert.match(detail, /const isDirect=/);
  assert.match(detail, /\/product\/detail\/508699/);
  assert.match(reader, /reader-directory/);
  assert.match(reader, /ค้นหา \{book\.title\} บน Google Books/);
  assert.match(externalBooks, /fallbackUrl/);
});

test("featured books embed playable YouTube summaries and Spotify tracks", async () => {
  const detail = await read("app/cup/[slug]/page.tsx");
  const youtubeIds = detail.match(/youtubeId:"[A-Za-z0-9_-]+"/g) ?? [];
  const spotifyIds = detail.match(/spotifyId:"[A-Za-z0-9]+"/g) ?? [];

  assert.equal(youtubeIds.length, 8);
  assert.equal(spotifyIds.length, 8);
  assert.match(detail, /youtube-nocookie\.com\/embed/);
  assert.match(detail, /visual animated summary/);
  assert.match(detail, /podcast discussion/);
  assert.match(detail, /String\(videoIndex\+1\).*videoOptions\.length/);
  assert.match(detail, /open\.spotify\.com\/embed\/track/);
  assert.match(detail, /playable=mediaOptions\.filter/);
  assert.match(detail, /setSpotify\(\{embedUrl:/);
  assert.doesNotMatch(detail, /setSpotify\(null\)/);
});

test("guest-first accounts use server sessions and migrate saved cups", async () => {
  const [migration, recoveryMigration, auth, signup, login, profile, savedCups,mail] = await Promise.all([
    read("drizzle/0005_user_auth.sql"),
    read("drizzle/0006_auth_recovery.sql"),
    read("lib/auth.ts"),
    read("app/api/auth/signup/route.ts"),
    read("app/api/auth/login/route.ts"),
    read("app/profile/page.tsx"),
    read("app/api/saved-cups/route.ts"),
    read("lib/mail.ts"),
  ]);

  assert.match(migration, /CREATE TABLE `auth_users`/);
  assert.match(migration, /CREATE TABLE `auth_sessions`/);
  assert.match(recoveryMigration, /CREATE TABLE `auth_tokens`/);
  assert.match(recoveryMigration, /CREATE TABLE `auth_rate_limits`/);
  assert.match(auth, /PBKDF2/);
  assert.match(auth, /210_000/);
  assert.match(auth, /HttpOnly; SameSite=Lax/);
  assert.match(auth, /migrateGuestData/);
  assert.match(auth, /update\(savedCups\)/);
  assert.match(signup, /hashPassword/);
  assert.match(login, /verifyPassword/);
  assert.match(profile, /\/api\/auth\/\$\{endpoint\}/);
  assert.match(profile, /OPTIONAL MEMBER ACCOUNT/);
  assert.match(profile, /forgot-password/);
  assert.match(profile, /resend-verification/);
  assert.match(savedCups, /getCurrentUser/);
  assert.match(mail, /api\.resend\.com\/emails/);
  assert.match(profile, /cup-of-us-pending-save/);
  assert.match(profile, /params\.get\("intent"\) === "save"/);
  assert.match(profile, /ดำเนินการต่อด้วย Google/);
  assert.match(profile, /ดำเนินการต่อด้วย Apple/);
});

test("social login uses provider state, verified identity and server session", async () => {
  const [migration,oauth,googleStart,googleCallback,appleCallback,providers]=await Promise.all([
    read("drizzle/0007_social_login.sql"),read("lib/oauth.ts"),read("app/api/auth/oauth/google/start/route.ts"),read("app/api/auth/oauth/google/callback/route.ts"),read("app/api/auth/oauth/apple/callback/route.ts"),read("app/api/auth/providers/route.ts")
  ]);
  assert.match(migration,/CREATE TABLE `auth_identities`/);
  assert.match(oauth,/HttpOnly; SameSite=Lax/);
  assert.match(oauth,/verifyAppleIdToken/);
  assert.match(oauth,/crypto\.subtle\.verify/);
  assert.match(googleStart,/accounts\.google\.com/);
  assert.match(googleCallback,/openidconnect\.googleapis\.com/);
  assert.match(appleCallback,/appleid\.apple\.com\/auth\/token/);
  assert.match(providers,/oauthConfig/);
});

test("YouTube results only embed verified video ids and keep a book-specific fallback", async()=>{
  const [detail,youtube]=await Promise.all([read("app/cup/[slug]/page.tsx"),read("app/api/external/youtube/route.ts")]);
  assert.match(youtube,/videoEmbeddable/);
  assert.match(youtube,/videoSyndicated/);
  assert.doesNotMatch(detail,/listType=search/);
  assert.match(detail,/youtube-search-card/);
});

test("cup result explains personality and supports contextual refills", async () => {
  const [detail,recommendation,quiz] = await Promise.all([
    read("app/cup/[slug]/page.tsx"),
    read("app/api/recommend/route.ts"),
    read("lib/brew-quiz.ts"),
  ]);
  assert.match(detail,/personality-donut/);
  assert.match(detail,/กราฟนี้สะท้อนคำตอบและพลังของคุณในเวลานี้/);
  assert.match(detail,/ขอแก้วเบากว่านี้/);
  assert.match(detail,/ขอแก้วลึกกว่านี้/);
  assert.match(detail,/ดูคนที่ชงแก้วคล้ายกัน/);
  assert.match(detail,/เปลี่ยนเพลง/);
  assert.match(detail,/เปลี่ยนกาแฟ\/คาเฟ่/);
  assert.match(detail,/navigator\.share/);
  assert.match(detail,/save_requires_account/);
  assert.match(detail,/cup-of-us-pending-save/);
  assert.match(detail,/google\.com\/maps\/search/);
  assert.match(detail,/youtube\.com\/results\?search_query/);
  assert.match(recommendation,/excludeSlugs/);
  assert.match(recommendation,/preference/);
  assert.equal((quiz.match(/traits:\{/g)??[]).length,35);
});

test("MVP is installable and keeps the brief's clear entry points", async () => {
  const [page, layout, manifest, worker] = await Promise.all([
    read("app/page.tsx"),
    read("app/layout.tsx"),
    read("app/manifest.ts"),
    read("public/sw.js"),
  ]);
  assert.match(page, /เริ่มชงแก้วของฉัน/);
  assert.match(page, /ตัวอย่างแก้วที่คุณอาจได้รับ/);
  assert.match(layout, /PwaRegister/);
  assert.match(manifest, /display: "standalone"/);
  assert.match(worker, /url\.pathname\.startsWith\("\/api\/"\)/);
});
