import { oauthConfig } from "../../../../lib/oauth";
export async function GET(){ return Response.json(oauthConfig(),{headers:{"cache-control":"no-store"}}) }
