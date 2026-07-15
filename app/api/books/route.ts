import { asc } from "drizzle-orm";
import { getDb } from "../../../db";
import { books } from "../../../db/schema";
export async function GET(request:Request){const url=new URL(request.url);const concern=(url.searchParams.get("concern")??"").toLowerCase();const rows=await getDb().select().from(books).orderBy(asc(books.id));const ranked=rows.sort((a,b)=>Number(b.concerns.toLowerCase().includes(concern))-Number(a.concerns.toLowerCase().includes(concern)));return Response.json({books:ranked.slice(0,50),total:rows.length});}
