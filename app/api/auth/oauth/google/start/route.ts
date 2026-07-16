import { createOAuthContext, oauthCallbackUrl, oauthConfig, profileError, providerEnv } from "../../../../../../lib/oauth";
export async function GET(request:Request){
  if(!oauthConfig().google)return Response.redirect(profileError(request,"google_not_configured"));
  const values=providerEnv(); const {context,cookie}=createOAuthContext(request,"google");
  const url=new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search=new URLSearchParams({client_id:values.GOOGLE_OAUTH_CLIENT_ID!,redirect_uri:oauthCallbackUrl(request,"google"),response_type:"code",scope:"openid email profile",state:context.state,nonce:context.nonce,prompt:"select_account"}).toString();
  return new Response(null,{status:302,headers:{location:url.toString(),"set-cookie":cookie}});
}
