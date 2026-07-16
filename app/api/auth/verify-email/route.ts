import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { authUsers } from "../../../../db/schema";
import { consumeAuthToken } from "../../../../lib/auth";

export async function POST(request:Request) {
  const { token } = await request.json().catch(() => ({}));
  const verified = await consumeAuthToken(token, "verify_email");
  if (!verified) return Response.json({ error:"ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว" }, { status:400 });
  await getDb().update(authUsers).set({ emailVerifiedAt:new Date() }).where(eq(authUsers.id, verified.userId));
  return Response.json({ ok:true });
}
