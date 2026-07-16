import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { getDb } from "../db";
import { authRateLimits, authSessions, authTokens, authUsers, creatorPosts, profiles, savedCups } from "../db/schema";

const encoder = new TextEncoder();
const SESSION_COOKIE = "cup_of_us_session";
const SESSION_DAYS = 30;
export type AuthTokenPurpose = "verify_email" | "password_reset";

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

export async function createAuthToken(userId: number, purpose: AuthTokenPurpose, lifetimeMinutes: number) {
  const db = getDb();
  await db.delete(authTokens).where(and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt)));
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = new Date(Date.now() + lifetimeMinutes * 60 * 1000);
  await db.insert(authTokens).values({ userId, purpose, tokenHash: await hashSessionToken(token), expiresAt });
  return { token, expiresAt };
}

export async function consumeAuthToken(rawToken: unknown, purpose: AuthTokenPurpose) {
  const token = String(rawToken ?? "");
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const db = getDb();
  const rows = await db.select({ id: authTokens.id, userId: authTokens.userId })
    .from(authTokens)
    .where(and(eq(authTokens.tokenHash, await hashSessionToken(token)), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt), gt(authTokens.expiresAt, new Date())))
    .limit(1);
  if (!rows[0]) return null;
  await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, rows[0].id));
  return rows[0];
}

function requestIp(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function consumeRateLimit(request: Request, action: string, identifier: string, maximum: number, windowMinutes: number) {
  const keyHash = await hashSessionToken(`${action}:${requestIp(request)}:${normalizeEmail(identifier)}`);
  const db = getDb();
  const now = new Date();
  const current = (await db.select().from(authRateLimits).where(eq(authRateLimits.keyHash, keyHash)).limit(1))[0];
  if (current && current.resetAt <= now) await db.delete(authRateLimits).where(eq(authRateLimits.id, current.id));
  else if (current && current.attempts >= maximum) return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000)) };
  const resetAt = new Date(now.getTime() + windowMinutes * 60 * 1000);
  await db.insert(authRateLimits).values({ keyHash, attempts: 1, resetAt, updatedAt: now })
    .onConflictDoUpdate({ target: authRateLimits.keyHash, set: { attempts: sql`${authRateLimits.attempts} + 1`, updatedAt: now } });
  return { allowed: true, retryAfter: 0 };
}

export async function clearRateLimit(request: Request, action: string, identifier: string) {
  const keyHash = await hashSessionToken(`${action}:${requestIp(request)}:${normalizeEmail(identifier)}`);
  await getDb().delete(authRateLimits).where(eq(authRateLimits.keyHash, keyHash));
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
  const rows = await getDb().select({ id: authUsers.id, email: authUsers.email, displayName: authUsers.displayName, emailVerifiedAt: authUsers.emailVerifiedAt })
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
