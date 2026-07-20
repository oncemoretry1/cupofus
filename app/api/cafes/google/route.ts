export async function GET(request: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return Response.json({ places: [], configured: false, message: "Add GOOGLE_PLACES_API_KEY in Netlify to enable live Google Places results." });
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "cafe in Bangkok Thailand").slice(0, 120);
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.priceLevel,places.primaryType",
    },
    body: JSON.stringify({ textQuery: query, pageSize: 12, languageCode: "th", regionCode: "TH", includedType: "cafe" }),
    cache: "no-store",
  });
  if (!response.ok) return Response.json({ places: [], configured: true, error: "Google Places request failed" }, { status: response.status });
  const payload = await response.json();
  return Response.json({ places: payload.places ?? [], configured: true, attribution: "Google Maps", storage: "live-response-only" });
}
