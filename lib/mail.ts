import { env } from "cloudflare:workers";

type MailEnv = { RESEND_API_KEY?: string; AUTH_EMAIL_FROM?: string; APP_BASE_URL?: string };

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[character] ?? character);

export function appBaseUrl(request: Request) {
  const runtime = env as unknown as MailEnv;
  return (runtime.APP_BASE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

export async function sendAuthEmail(input: { to:string; displayName:string; actionUrl:string; kind:"verify"|"reset" }) {
  const runtime = env as unknown as MailEnv;
  if (!runtime.RESEND_API_KEY || !runtime.AUTH_EMAIL_FROM) return { sent:false, reason:"email_not_configured" } as const;
  const isVerify = input.kind === "verify";
  const title = isVerify ? "ยืนยันอีเมลของคุณ" : "ตั้งรหัสผ่านใหม่";
  const intro = isVerify ? "กดปุ่มนี้เพื่อยืนยันว่าอีเมลนี้เป็นของคุณ และเก็บทุกแก้วไว้ในบัญชี Cup of Us" : "เราได้รับคำขอตั้งรหัสผ่านใหม่ หากไม่ใช่คุณ สามารถปล่อยอีเมลนี้ไว้ได้เลย";
  const response = await fetch("https://api.resend.com/emails", {
    method:"POST",
    headers:{ authorization:`Bearer ${runtime.RESEND_API_KEY}`, "content-type":"application/json", "user-agent":"CupOfUs/1.0" },
    body:JSON.stringify({
      from:runtime.AUTH_EMAIL_FROM,
      to:[input.to],
      subject:`Cup of Us · ${title}`,
      html:`<div style="background:#f4edda;padding:32px;font-family:Arial,sans-serif;color:#172f2b"><div style="max-width:560px;margin:auto;background:#fffdf5;border:2px solid #172f2b;padding:32px"><p style="letter-spacing:.18em;font-size:11px">CUP OF US</p><h1 style="font-size:34px">${title}</h1><p>สวัสดี ${escapeHtml(input.displayName)}</p><p style="line-height:1.7">${intro}</p><p style="margin:30px 0"><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:#f5e545;border:2px solid #172f2b;color:#172f2b;padding:14px 22px;text-decoration:none;font-weight:bold">${title} →</a></p><small>ลิงก์นี้ใช้ได้ครั้งเดียวและจะหมดอายุตามเวลาที่กำหนด</small></div></div>`,
      text:`${title}\n\n${intro}\n\n${input.actionUrl}`,
    }),
  });
  return response.ok ? { sent:true } as const : { sent:false, reason:"email_provider_error" } as const;
}
