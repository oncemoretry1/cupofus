import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { authUsers } from "../../../../db/schema";
import { consumeRateLimit, createAuthToken, getCurrentUser } from "../../../../lib/auth";
import { appBaseUrl, sendAuthEmail } from "../../../../lib/mail";

export async function POST(request:Request) {
  const current = await getCurrentUser(request);
  if (!current) return Response.json({ error:"กรุณาเข้าสู่ระบบก่อน" }, { status:401 });
  if (current.emailVerifiedAt) return Response.json({ ok:true, alreadyVerified:true });
  const rate = await consumeRateLimit(request, "resend_verification", current.email, 3, 60);
  if (!rate.allowed) return Response.json({ error:"ส่งซ้ำถี่เกินไป ลองใหม่ภายหลังนะ" }, { status:429, headers:{ "retry-after":String(rate.retryAfter) } });
  const user = (await getDb().select({ id:authUsers.id, email:authUsers.email, displayName:authUsers.displayName }).from(authUsers).where(eq(authUsers.id,current.id)).limit(1))[0];
  const verification = await createAuthToken(user.id, "verify_email", 24 * 60);
  const verificationUrl = `${appBaseUrl(request)}/verify-email?token=${verification.token}`;
  const mail = await sendAuthEmail({ to:user.email, displayName:user.displayName, actionUrl:verificationUrl, kind:"verify" });
  const isLocal = new URL(request.url).hostname === "localhost";
  return Response.json({ ok:true, emailSent:mail.sent, ...(isLocal?{verificationUrl}:{}) });
}
