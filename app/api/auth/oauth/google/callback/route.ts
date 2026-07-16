import { clearOAuthCookie, finishOAuth, oauthCallbackUrl, profileError, providerEnv, readOAuthContext } from "../../../../../../lib/oauth";
export async function GET(request:Request){
  const url=new URL(request.url); const state=url.searchParams.get("state")??""; const context=readOAuthContext(request,"google",state); const code=url.searchParams.get("code");
  if(!context||!code)return Response.redirect(profileError(request,"google_cancelled"));
  try{ const values=providerEnv(); const token=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:values.GOOGLE_OAUTH_CLIENT_ID!,client_secret:values.GOOGLE_OAUTH_CLIENT_SECRET!,redirect_uri:oauthCallbackUrl(request,"google"),grant_type:"authorization_code"})}).then(r=>r.ok?r.json():Promise.reject(new Error("token_exchange_failed"))) as {access_token:string};
    const person=await fetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{authorization:`Bearer ${token.access_token}`}}).then(r=>r.ok?r.json():Promise.reject(new Error("userinfo_failed"))) as {sub:string;email:string;email_verified:boolean;name?:string};
    if(!person.email_verified)throw new Error("email_not_verified");
    const response=await finishOAuth(request,{provider:"google",subject:person.sub,email:person.email,displayName:person.name??"Cup of Us member",guestId:context.guestId,returnTo:context.returnTo});
    response.headers.append("set-cookie",clearOAuthCookie(request)); return response;
  }catch{return Response.redirect(profileError(request,"google_failed"))}
}
