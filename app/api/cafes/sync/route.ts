import { sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { cafes } from "../../../../db/schema";
import { inferCafeMoods } from "../../../../lib/cafe-directory";

type OsmElement = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

const overpassQuery = `[out:json][timeout:120];area["ISO3166-2"="TH-10"]->.bkk;(nwr["amenity"="cafe"](area.bkk);nwr["shop"="coffee"](area.bkk););out center tags;`;

export async function POST(request: Request) {
  const expected = process.env.ADMIN_SYNC_TOKEN;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return Response.json({ error: "unauthorized" }, { status: 401 });
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "CupOfUs/1.0 cafe-directory" },
    body: new URLSearchParams({ data: overpassQuery }), cache: "no-store",
  });
  if (!response.ok) return Response.json({ error: "OpenStreetMap sync failed" }, { status: 502 });
  const payload = await response.json() as { elements: OsmElement[] };
  const records = payload.elements.flatMap(element => {
    const tags = element.tags ?? {};
    const name = tags["name:th"] || tags.name || tags["name:en"];
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    if (!name || latitude == null || longitude == null) return [];
    const area = tags["addr:subdistrict"] || tags["addr:district"] || tags["addr:city"] || "Bangkok";
    const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:district"]].filter(Boolean).join(" ");
    return [{ source: "osm", sourceId: `${element.type}/${element.id}`, name, area, address: address || null, latitude: String(latitude), longitude: String(longitude), categories: tags.shop === "coffee" ? "coffee-shop" : "cafe", moodTags: inferCafeMoods(tags).join(","), rawTags: JSON.stringify(tags), syncedAt: new Date() }];
  }).slice(0, 1000);
  const db = getDb();
  for (let index = 0; index < records.length; index += 100) {
    await db.insert(cafes).values(records.slice(index, index + 100)).onConflictDoUpdate({
      target: [cafes.source, cafes.sourceId],
      set: { name: sql`excluded.name`, area: sql`excluded.area`, address: sql`excluded.address`, latitude: sql`excluded.latitude`, longitude: sql`excluded.longitude`, categories: sql`excluded.categories`, moodTags: sql`excluded.mood_tags`, rawTags: sql`excluded.raw_tags`, syncedAt: sql`excluded.synced_at` },
    });
  }
  return Response.json({ imported: records.length, cappedAt: 1000, source: "OpenStreetMap / ODbL", googleEnrichment: "live-only" });
}
