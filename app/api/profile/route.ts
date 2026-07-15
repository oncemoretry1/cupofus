import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";
export async function GET(request:Request){const guestId=new URL(request.url).searchParams.get("guestId");if(!guestId)return Response.json({profile:null},{status:400});const rows=await getDb().select().from(profiles).where(eq(profiles.email,guestId)).limit(1);return Response.json({profile:rows[0]??null})}
export async function POST(request:Request){const {guestId,displayName,favoriteTopics=[]}=await request.json();if(!guestId||!displayName)return Response.json({error:"missing fields"},{status:400});await getDb().insert(profiles).values({email:String(guestId),displayName:String(displayName).slice(0,60),favoriteTopics:JSON.stringify(favoriteTopics)}).onConflictDoUpdate({target:profiles.email,set:{displayName:String(displayName).slice(0,60),favoriteTopics:JSON.stringify(favoriteTopics)}});return Response.json({ok:true})}
