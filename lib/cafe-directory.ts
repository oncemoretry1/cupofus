export type CafeSuggestion = {
  id: string;
  name: string;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  moodTags: string[];
  source: "osm" | "curated";
  sourceId?: string;
  googleMapsUrl: string;
};

const mapSearch = (name: string, area: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${area} Bangkok`)}`;

// A small, human-reviewed fallback keeps Club useful before the full Bangkok
// directory is synced. The sync route expands this to 500–1,000 OSM places.
const featured = [
  ["Factory Coffee", "Phaya Thai", ["focus", "coffee", "morning"]],
  ["Gallery Drip Coffee", "Pathum Wan", ["calm", "art", "reading"]],
  ["Roots at Sathon", "Sathon", ["focus", "design", "work"]],
  ["NANA Coffee Roasters Ari", "Ari", ["social", "coffee", "weekend"]],
  ["Mother Roaster", "Talat Noi", ["curious", "slow", "heritage"]],
  ["Sarnies Bangkok", "Charoen Krung", ["social", "brunch", "creative"]],
  ["Akha Ama Coffee", "Phra Nakhon", ["calm", "community", "coffee"]],
  ["Karo Coffee Roasters", "Sukhumvit", ["focus", "coffee", "quiet"]],
  ["Luka Cafe", "Silom", ["social", "brunch", "work"]],
  ["Toby's", "Sukhumvit", ["social", "brunch", "weekend"]],
  ["Casa Lapin", "Ari", ["reading", "work", "everyday"]],
  ["Rocket Coffeebar", "Sathon", ["design", "morning", "social"]],
] as const;

export const featuredBangkokCafes: CafeSuggestion[] = featured.map(([name, area, moodTags], index) => ({
  id: `featured-${index + 1}`,
  name,
  area,
  moodTags: [...moodTags],
  source: "curated",
  googleMapsUrl: mapSearch(name, area),
}));

export function inferCafeMoods(tags: Record<string, string>) {
  const text = Object.values(tags).join(" ").toLowerCase();
  const moods = new Set<string>();
  if (/wifi|internet_access|cowork|laptop/.test(text)) moods.add("work");
  if (/garden|outdoor|terrace|quiet/.test(text)) moods.add("calm");
  if (/roaster|specialty|coffee/.test(text)) moods.add("coffee");
  if (/book|library|reading/.test(text)) moods.add("reading");
  if (/breakfast|brunch|bakery/.test(text)) moods.add("morning");
  if (/bar|music|live/.test(text)) moods.add("social");
  if (!moods.size) moods.add("everyday");
  return [...moods];
}

export function googleMapsLink(name: string, area: string, placeId?: string | null) {
  if (placeId) return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}&query=${encodeURIComponent(name)}`;
  return mapSearch(name, area);
}
