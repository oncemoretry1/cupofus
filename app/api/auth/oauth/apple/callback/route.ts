import { clearOAuthCookie, finishOAuth, oauthCallbackUrl, profileError, providerEnv, readOAuthContext, verifyAppleIdToken } from "../../../../../../lib/oauth";
export async function POST(request:Request){
  const form=await request.formData(); const state=String(form.get("state")??""); const code=String(form.get("code")??""); const context=readOAuthContext(request,"apple",state);
  if(!context||!code)return Response.redirect(profileError(request,"apple_cancelled"));
  try{ const values=providerEnv(); const result=await fetch("https://appleid.apple.com/auth/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:values.APPLE_CLIENT_ID!,client_secret:values.APPLE_CLIENT_SECRET!,code,grant_type:"authorization_code",redirect_uri:oauthCallbackUrl(request,"apple")})}).then(r=>r.ok?r.json():Promise.reject(new Error("token_exchange_failed"))) as {id_token:string};
    const claims=await verifyAppleIdToken(result.id_token,values.APPLE_CLIENT_ID!,context.nonce); const email=String(claims.email??"");
    const userRaw=String(form.get("user")??""); let name="Cup of Us member"; try{const person=JSON.parse(userRaw);name=[person.name?.firstName,person.name?.lastName].filter(Boolean).join(" ")||name}catch{}
    const response=await finishOAuth(request,{provider:"apple",subject:String(claims.sub??""),email,displayName:name,guestId:context.guestId,returnTo:context.returnTo}); response.headers.append("set-cookie",clearOAuthCookie(request)); return response;
  }catch{return Response.redirect(profileError(request,"apple_failed"))}
}
