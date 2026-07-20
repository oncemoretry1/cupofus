import { asc, ilike, or, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { cafes } from "../../../db/schema";
import { featuredBangkokCafes, googleMapsLink } from "../../../lib/cafe-directory";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const mood = (url.searchParams.get("mood") ?? "").trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 12), 1), 100);
  try {
    const where = query
      ? or(ilike(cafes.name, `%${query}%`), ilike(cafes.area, `%${query}%`), ilike(cafes.moodTags, `%${query}%`))
      : mood ? ilike(cafes.moodTags, `%${mood}%`) : undefined;
    const rows = await getDb().select().from(cafes).where(where).orderBy(asc(cafes.name)).limit(limit);
    const [{ count }] = await getDb().select({ count: sql<number>`count(*)` }).from(cafes);
    if (rows.length) return Response.json({
      cafes: rows.map(row => ({
        id: `${row.source}-${row.sourceId}`, name: row.name, area: row.area, address: row.address,
        latitude: row.latitude ? Number(row.latitude) : undefined, longitude: row.longitude ? Number(row.longitude) : undefined,
        moodTags: row.moodTags.split(",").filter(Boolean), source: row.source,
        googleMapsUrl: googleMapsLink(row.name, row.area, row.googlePlaceId),
      })),
      total: Number(count), source: "database",
    });
  } catch {
    // A fresh deploy can briefly serve traffic before its DB migration finishes.
  }
  const fallback = featuredBangkokCafes.filter(cafe => !query || `${cafe.name} ${cafe.area} ${cafe.moodTags.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return Response.json({ cafes: fallback.slice(0, limit), total: fallback.length, source: "curated-fallback" });
}
