import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { authUsers } from "../../../../db/schema";
import { clearRateLimit, consumeRateLimit, createSession, migrateGuestData, normalizeEmail, sessionCookie, verifyPassword } from "../../../../lib/auth";

export async function POST(request: Request) {
  const { email: rawEmail, password, guestId } = await request.json();
  const email = normalizeEmail(rawEmail);
  if (!email || typeof password !== "string") return Response.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 400 });
  const rate = await consumeRateLimit(request, "login", email, 6, 15);
  if (!rate.allowed) return Response.json({ error: "ลองเข้าสู่ระบบหลายครั้งเกินไป พักสักครู่แล้วลองใหม่" }, { status: 429, headers:{ "retry-after":String(rate.retryAfter) } });
  const users = await getDb().select().from(authUsers).where(eq(authUsers.email, email)).limit(1);
  const user = users[0];
  if (!user || !(await verifyPassword(password, user.passwordHash, user.passwordSalt))) return Response.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  await clearRateLimit(request, "login", email);
  await migrateGuestData(guestId, user.email, user.displayName);
  const session = await createSession(user.id);
  return Response.json({ user: { id: user.id, email: user.email, displayName: user.displayName, emailVerifiedAt:user.emailVerifiedAt } }, { headers: { "set-cookie": sessionCookie(request, session.token, session.expiresAt) } });
}
