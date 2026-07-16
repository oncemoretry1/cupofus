import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { authUsers } from "../../../../db/schema";
import { consumeRateLimit, createAuthToken, createSession, hashPassword, migrateGuestData, normalizeEmail, sessionCookie, validEmail } from "../../../../lib/auth";
import { appBaseUrl, sendAuthEmail } from "../../../../lib/mail";

export async function POST(request: Request) {
  const { email: rawEmail, password, displayName, guestId } = await request.json();
  const email = normalizeEmail(rawEmail);
  const name = String(displayName ?? "").trim().slice(0, 60);
  if (!validEmail(email)) return Response.json({ error: "กรุณาใส่อีเมลให้ถูกต้อง" }, { status: 400 });
  const rate = await consumeRateLimit(request, "signup", email, 5, 60);
  if (!rate.allowed) return Response.json({ error: "สมัครถี่เกินไป พักก่อนแล้วลองใหม่นะ" }, { status: 429, headers:{ "retry-after":String(rate.retryAfter) } });
  if (!name) return Response.json({ error: "กรุณาใส่ชื่อที่อยากให้เราเรียก" }, { status: 400 });
  if (typeof password !== "string" || password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return Response.json({ error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัว พร้อมตัวอักษรและตัวเลข" }, { status: 400 });
  const db = getDb();
  if ((await db.select({ id: authUsers.id }).from(authUsers).where(eq(authUsers.email, email)).limit(1))[0]) return Response.json({ error: "อีเมลนี้มีบัญชีแล้ว ลองเข้าสู่ระบบแทน" }, { status: 409 });
  const credentials = await hashPassword(password);
  const users = await db.insert(authUsers).values({ email, displayName: name, passwordHash: credentials.hash, passwordSalt: credentials.salt }).returning({ id: authUsers.id, email: authUsers.email, displayName: authUsers.displayName });
  const user = users[0];
  await migrateGuestData(guestId, email, name);
  const verification = await createAuthToken(user.id, "verify_email", 24 * 60);
  const verificationUrl = `${appBaseUrl(request)}/verify-email?token=${verification.token}`;
  const mail = await sendAuthEmail({ to:user.email, displayName:user.displayName, actionUrl:verificationUrl, kind:"verify" });
  const session = await createSession(user.id);
  const isLocal = new URL(request.url).hostname === "localhost";
  return Response.json({ user:{...user,emailVerifiedAt:null}, emailSent:mail.sent, ...(isLocal?{verificationUrl}:{}) }, { status: 201, headers: { "set-cookie": sessionCookie(request, session.token, session.expiresAt) } });
}
