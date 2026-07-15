import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { mediaPairings } from "../../../db/schema";
export async function GET(request:Request){const slug=new URL(request.url).searchParams.get("slug");if(slug){const row=await getDb().select().from(mediaPairings).where(eq(mediaPairings.bookSlug,slug)).limit(1);return Response.json({pairing:row[0]??null})}const pairings=await getDb().select().from(mediaPairings).orderBy(asc(mediaPairings.id));return Response.json({pairings,total:pairings.length});}
