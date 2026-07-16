import { createOAuthContext, oauthCallbackUrl, oauthConfig, profileError, providerEnv } from "../../../../../../lib/oauth";
export async function GET(request:Request){
  if(!oauthConfig().apple)return Response.redirect(profileError(request,"apple_not_configured"));
  const values=providerEnv(); const {context,cookie}=createOAuthContext(request,"apple"); const url=new URL("https://appleid.apple.com/auth/authorize");
  url.search=new URLSearchParams({client_id:values.APPLE_CLIENT_ID!,redirect_uri:oauthCallbackUrl(request,"apple"),response_type:"code",response_mode:"form_post",scope:"name email",state:context.state,nonce:context.nonce}).toString();
  return new Response(null,{status:302,headers:{location:url.toString(),"set-cookie":cookie}});
}
