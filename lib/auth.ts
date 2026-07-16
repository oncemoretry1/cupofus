import { and, eq, gt } from "drizzle-orm";
import { getDb } from "../db";
import { authSessions, authUsers, creatorPosts, profiles, savedCups } from "../db/schema";

const encoder = new TextEncoder();
const SESSION_COOKIE = "cup_of_us_session";
const SESSION_DAYS = 30;

const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
const fromHex = (value: string) => new Uint8Array(value.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);

export const normalizeEmail = (email: unknown) => String(email ?? "").trim().toLowerCase();
export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

export async function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 210_000, hash: "SHA-256" }, key, 256);
  return { hash: toHex(new Uint8Array(bits)), salt: toHex(salt) };
}

export async function verifyPassword(password: string, expectedHash: string, salt: string) {
  const candidate = (await hashPassword(password, salt)).hash;
  if (candidate.length !== expectedHash.length) return false;
  let difference = 0;
  for (let index = 0; index < candidate.length; index += 1) difference |= candidate.charCodeAt(index) ^ expectedHash.charCodeAt(index);
  return difference === 0;
}

export async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return toHex(new Uint8Array(digest));
}

export async function createSession(userId: number) {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await getDb().insert(authSessions).values({ userId, tokenHash: await hashSessionToken(token), expiresAt });
  return { token, expiresAt };
}

export function readSessionToken(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1) ?? "";
}

export function sessionCookie(request: Request, token: string, expiresAt: Date) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`;
}

export function clearSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function getCurrentUser(request: Request) {
  const token = readSessionToken(request);
  if (!token) return null;
  const rows = await getDb().select({ id: authUsers.id, email: authUsers.email, displayName: authUsers.displayName })
    .from(authSessions).innerJoin(authUsers, eq(authSessions.userId, authUsers.id))
    .where(and(eq(authSessions.tokenHash, await hashSessionToken(token)), gt(authSessions.expiresAt, new Date()))).limit(1);
  return rows[0] ?? null;
}

export async function deleteCurrentSession(request: Request) {
  const token = readSessionToken(request);
  if (token) await getDb().delete(authSessions).where(eq(authSessions.tokenHash, await hashSessionToken(token)));
}

export async function migrateGuestData(guestId: unknown, email: string, displayName: string) {
  const guest = String(guestId ?? "");
  if (!guest.startsWith("guest-") || guest.length > 80) return;
  const db = getDb();
  const guestProfiles = await db.select().from(profiles).where(eq(profiles.email, guest)).limit(1);
  if (guestProfiles[0]) {
    await db.insert(profiles).values({ email, displayName: guestProfiles[0].displayName || displayName, bio: guestProfiles[0].bio, favoriteTopics: guestProfiles[0].favoriteTopics })
      .onConflictDoUpdate({ target: profiles.email, set: { displayName: guestProfiles[0].displayName || displayName, bio: guestProfiles[0].bio, favoriteTopics: guestProfiles[0].favoriteTopics } });
  } else {
    await db.insert(profiles).values({ email, displayName }).onConflictDoNothing({ target: profiles.email });
  }
  await db.update(savedCups).set({ userEmail: email }).where(eq(savedCups.userEmail, guest));
  await db.update(creatorPosts).set({ userEmail: email }).where(eq(creatorPosts.userEmail, guest));
  await db.delete(profiles).where(eq(profiles.email, guest));
}
