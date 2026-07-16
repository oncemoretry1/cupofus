import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { authSessions, authUsers } from "../../../../db/schema";
import { consumeAuthToken, hashPassword } from "../../../../lib/auth";

export async function POST(request:Request) {
  const { token, password } = await request.json().catch(() => ({}));
  if (typeof password !== "string" || password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return Response.json({ error:"รหัสผ่านต้องมีอย่างน้อย 8 ตัว พร้อมตัวอักษรและตัวเลข" }, { status:400 });
  const reset = await consumeAuthToken(token, "password_reset");
  if (!reset) return Response.json({ error:"ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว" }, { status:400 });
  const credentials = await hashPassword(password);
  const db = getDb();
  await db.update(authUsers).set({ passwordHash:credentials.hash, passwordSalt:credentials.salt }).where(eq(authUsers.id,reset.userId));
  await db.delete(authSessions).where(eq(authSessions.userId,reset.userId));
  return Response.json({ ok:true });
}
