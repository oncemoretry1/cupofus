import { asc } from "drizzle-orm";
import { getDb } from "../../../db";
import { mediaPairings } from "../../../db/schema";
export async function GET(){const pairings=await getDb().select().from(mediaPairings).orderBy(asc(mediaPairings.id));return Response.json({pairings,total:pairings.length});}
