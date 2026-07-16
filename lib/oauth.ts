import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { authIdentities, authUsers } from "../db/schema";
import { createSession, hashPassword, migrateGuestData, normalizeEmail, sessionCookie, validEmail } from "./auth";

export type OAuthProvider = "google" | "apple";
type OAuthContext = { state:string; nonce:string; guestId:string; returnTo:string; provider:OAuthProvider; saveIntent:boolean };

const bytes = (length=32) => crypto.getRandomValues(new Uint8Array(length));
const b64url = (value:Uint8Array|string) => {
  const raw=typeof value==="string"?new TextEncoder().encode(value):value;
  return btoa(String.fromCharCode(...raw)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
};
const decode = (value:string) => Uint8Array.from(atob(value.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(value.length/4)*4,"=")),char=>char.charCodeAt(0));
const safeReturnTo = (value:unknown) => { const path=String(value??""); return path.startsWith("/")&&!path.startsWith("//")?path:"/profile" };
const cookieValue = (request:Request,name:string) => (request.headers.get("cookie")??"").split(";").map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.slice(name.length+1)??"";
const secure = (request:Request) => new URL(request.url).protocol==="https:"?"; Secure":"";
export const oauthConfig = () => {
  const values=env as unknown as Record<string,string|undefined>;
  return { google:Boolean(values.GOOGLE_OAUTH_CLIENT_ID&&values.GOOGLE_OAUTH_CLIENT_SECRET), apple:Boolean(values.APPLE_CLIENT_ID&&values.APPLE_CLIENT_SECRET) };
};
export const providerEnv = () => env as unknown as Record<string,string|undefined>;
export function createOAuthContext(request:Request,provider:OAuthProvider) {
  const url=new URL(request.url); const state=b64url(bytes()); const nonce=b64url(bytes());
  const context:OAuthContext={state,nonce,provider,guestId:String(url.searchParams.get("guestId")??"").slice(0,80),returnTo:safeReturnTo(url.searchParams.get("returnTo")),saveIntent:url.searchParams.get("intent")==="save"};
  const encoded=b64url(JSON.stringify(context));
  return {context,cookie:`cup_of_us_oauth=${encoded}; Path=/api/auth/oauth; HttpOnly; SameSite=Lax; Max-Age=600${secure(request)}`};
}
export function readOAuthContext(request:Request,provider:OAuthProvider,state:string) {
  try { const parsed=JSON.parse(new TextDecoder().decode(decode(cookieValue(request,"cup_of_us_oauth")))) as OAuthContext; return parsed.provider===provider&&parsed.state===state?parsed:null } catch { return null }
}
export const clearOAuthCookie = (request:Request) => `cup_of_us_oauth=; Path=/api/auth/oauth; HttpOnly; SameSite=Lax; Max-Age=0${secure(request)}`;
export const oauthCallbackUrl = (request:Request,provider:OAuthProvider) => `${new URL(request.url).origin}/api/auth/oauth/${provider}/callback`;
export const profileError = (request:Request,code:string) => new URL(`/profile?oauth=${encodeURIComponent(code)}`,new URL(request.url).origin);

export async function finishOAuth(request:Request,input:{provider:OAuthProvider;subject:string;email:string;displayName:string;guestId:string;returnTo:string}) {
  const email=normalizeEmail(input.email); if(!validEmail(email)||!input.subject) throw new Error("invalid_identity");
  const db=getDb();
  const identity=(await db.select({userId:authIdentities.userId}).from(authIdentities).where(and(eq(authIdentities.provider,input.provider),eq(authIdentities.providerSubject,input.subject))).limit(1))[0];
  let user=identity?(await db.select().from(authUsers).where(eq(authUsers.id,identity.userId)).limit(1))[0]:null;
  if(!user) {
    user=(await db.select().from(authUsers).where(eq(authUsers.email,email)).limit(1))[0]??null;
    if(!user) { const generated=await hashPassword(b64url(bytes(48))); user=(await db.insert(authUsers).values({email,displayName:input.displayName||email.split("@")[0],passwordHash:generated.hash,passwordSalt:generated.salt,emailVerifiedAt:new Date()}).returning())[0] }
    else if(!user.emailVerifiedAt) { user=(await db.update(authUsers).set({emailVerifiedAt:new Date()}).where(eq(authUsers.id,user.id)).returning())[0] }
    await db.insert(authIdentities).values({userId:user.id,provider:input.provider,providerSubject:input.subject}).onConflictDoNothing();
  }
  await migrateGuestData(input.guestId,user.email,user.displayName);
  const session=await createSession(user.id);
  const destination=input.returnTo&&input.returnTo!=="/profile"?new URL("/profile",new URL(request.url).origin):new URL(safeReturnTo(input.returnTo),new URL(request.url).origin);
  destination.searchParams.set("oauth","success");
  if(input.returnTo&&input.returnTo!=="/profile"){destination.searchParams.set("intent","save");destination.searchParams.set("returnTo",safeReturnTo(input.returnTo))}
  return new Response(null,{status:302,headers:{location:destination.toString(),"set-cookie":sessionCookie(request,session.token,session.expiresAt)}});
}

export async function verifyAppleIdToken(token:string,clientId:string,nonce:string) {
  const parts=token.split("."); if(parts.length!==3) throw new Error("invalid_apple_token");
  const header=JSON.parse(new TextDecoder().decode(decode(parts[0]))) as {kid?:string;alg?:string};
  const claims=JSON.parse(new TextDecoder().decode(decode(parts[1]))) as Record<string,unknown>;
  if(header.alg!=="RS256"||!header.kid||claims.iss!=="https://appleid.apple.com"||claims.aud!==clientId||Number(claims.exp??0)*1000<Date.now()||claims.nonce!==nonce) throw new Error("invalid_apple_claims");
  const keys=await fetch("https://appleid.apple.com/auth/keys").then(r=>r.json()) as {keys:JsonWebKey[]};
  const jwk=keys.keys.find(key=>(key as JsonWebKey&{kid?:string}).kid===header.kid); if(!jwk) throw new Error("apple_key_missing");
  const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
  const valid=await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,decode(parts[2]),new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if(!valid) throw new Error("invalid_apple_signature"); return claims;
}
