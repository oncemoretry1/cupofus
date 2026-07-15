import { getDb } from "../../../db";
import { analyticsEvents } from "../../../db/schema";
export async function POST(request:Request){const {sessionId,eventName,bookSlug,source,metadata={}}=await request.json();if(!sessionId||!eventName)return Response.json({error:"missing fields"},{status:400});await getDb().insert(analyticsEvents).values({sessionId:String(sessionId),eventName:String(eventName).slice(0,60),bookSlug:bookSlug?String(bookSlug):null,source:source?String(source):null,metadata:JSON.stringify(metadata)});return Response.json({ok:true})}
