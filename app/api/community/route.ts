import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { creatorPosts } from "../../../db/schema";
export async function GET(){const posts=await getDb().select().from(creatorPosts).orderBy(desc(creatorPosts.createdAt)).limit(50);return Response.json({posts})}
export async function POST(request:Request){const {guestId,kind,title,body,bookId}=await request.json();if(!guestId||!kind||!title||!body)return Response.json({error:"missing fields"},{status:400});const row=await getDb().insert(creatorPosts).values({userEmail:String(guestId),kind:String(kind).slice(0,20),title:String(title).slice(0,120),body:String(body).slice(0,1200),bookId:bookId?Number(bookId):null,status:"published"}).returning();return Response.json({post:row[0]})}
