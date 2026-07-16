import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { authUsers } from "../../../../db/schema";
import { createSession, migrateGuestData, normalizeEmail, sessionCookie, verifyPassword } from "../../../../lib/auth";

export async function POST(request: Request) {
  const { email: rawEmail, password, guestId } = await request.json();
  const email = normalizeEmail(rawEmail);
  if (!email || typeof password !== "string") return Response.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 400 });
  const users = await getDb().select().from(authUsers).where(eq(authUsers.email, email)).limit(1);
  const user = users[0];
  if (!user || !(await verifyPassword(password, user.passwordHash, user.passwordSalt))) return Response.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  await migrateGuestData(guestId, user.email, user.displayName);
  const session = await createSession(user.id);
  return Response.json({ user: { id: user.id, email: user.email, displayName: user.displayName } }, { headers: { "set-cookie": sessionCookie(request, session.token, session.expiresAt) } });
}
