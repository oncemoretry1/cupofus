import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { authUsers } from "../../../../db/schema";
import { consumeRateLimit, createAuthToken, normalizeEmail, validEmail } from "../../../../lib/auth";
import { appBaseUrl, sendAuthEmail } from "../../../../lib/mail";

export async function POST(request:Request) {
  const { email:rawEmail } = await request.json().catch(() => ({}));
  const email = normalizeEmail(rawEmail);
  if (!validEmail(email)) return Response.json({ ok:true });
  const rate = await consumeRateLimit(request, "forgot_password", email, 3, 60);
  if (!rate.allowed) return Response.json({ ok:true }, { headers:{ "retry-after":String(rate.retryAfter) } });
  const user = (await getDb().select({ id:authUsers.id, email:authUsers.email, displayName:authUsers.displayName }).from(authUsers).where(eq(authUsers.email,email)).limit(1))[0];
  if (!user) return Response.json({ ok:true });
  const reset = await createAuthToken(user.id, "password_reset", 30);
  const resetUrl = `${appBaseUrl(request)}/reset-password?token=${reset.token}`;
  const mail = await sendAuthEmail({ to:user.email, displayName:user.displayName, actionUrl:resetUrl, kind:"reset" });
  const isLocal = new URL(request.url).hostname === "localhost";
  return Response.json({ ok:true, emailSent:mail.sent, ...(isLocal?{resetUrl}:{}) });
}
