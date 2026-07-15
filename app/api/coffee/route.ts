import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { coffeePairings } from "../../../db/schema";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    const pairings = await getDb().select().from(coffeePairings).orderBy(asc(coffeePairings.id));
    return Response.json({ pairings, total: pairings.length });
  }
  const pairing = (await getDb().select().from(coffeePairings).where(eq(coffeePairings.bookSlug, slug)).limit(1))[0];
  return Response.json({ pairing: pairing ?? null });
}
