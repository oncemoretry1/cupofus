const baseUrl = process.env.BASE_URL || "http://localhost:3001";
const unique = Date.now();
const email = `codex-auth-${unique}@cupofus.local`;
const password = "CupOfUs1234";
const newPassword = "CupOfUs5678";

async function json(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers || {}) },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${path}: ${response.status} ${JSON.stringify(body)}`);
  return { response, body };
}

const signup = await json("/api/auth/signup", {
  method: "POST",
  body: JSON.stringify({
    email,
    password,
    displayName: "Codex Auth Test",
    guestId: `guest-${unique}`,
  }),
});
const cookie = signup.response.headers.get("set-cookie")?.split(";")[0];
if (!cookie) throw new Error("signup did not set a session cookie");
if (!signup.body.verificationUrl) throw new Error("local signup did not return verificationUrl");

const verificationToken = new URL(signup.body.verificationUrl).searchParams.get("token");
await json("/api/auth/verify-email", {
  method: "POST",
  body: JSON.stringify({ token: verificationToken }),
});

const verifiedSession = await json("/api/auth/session", {
  headers: { cookie },
});
if (!verifiedSession.body.user?.emailVerifiedAt) {
  throw new Error("email verification was not reflected in the session");
}

const forgot = await json("/api/auth/forgot-password", {
  method: "POST",
  body: JSON.stringify({ email }),
});
if (!forgot.body.resetUrl) throw new Error("local forgot-password did not return resetUrl");
const resetToken = new URL(forgot.body.resetUrl).searchParams.get("token");

await json("/api/auth/reset-password", {
  method: "POST",
  body: JSON.stringify({ token: resetToken, password: newPassword }),
});

const revokedSession = await json("/api/auth/session", {
  headers: { cookie },
});
if (revokedSession.body.user) throw new Error("old session survived password reset");

const login = await json("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password: newPassword }),
});
if (!login.body.user?.emailVerifiedAt) throw new Error("login after reset failed");

console.log(JSON.stringify({ ok: true, email, checks: 6 }, null, 2));
