export type PodcastEpisode = {
  id: string;
  title: string;
  show: string;
  author: string;
  audioUrl: string;
  externalUrl: string;
  artworkUrl?: string;
  publishedAt?: string;
  durationSeconds?: number;
  source: "apple-rss";
};

type AppleEpisode = {
  trackId?: number;
  trackName?: string;
  collectionName?: string;
  artistName?: string;
  episodeUrl?: string;
  trackViewUrl?: string;
  collectionViewUrl?: string;
  artworkUrl600?: string;
  releaseDate?: string;
  trackTimeMillis?: number;
  feedUrl?: string;
};

const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, " ").trim();
const decodeXml = (value: string) => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
const xmlText = (block: string, tag: string) => decodeXml(block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] ?? "");
const xmlAttribute = (block: string, tag: string, attribute: string) => decodeXml(block.match(new RegExp(`<${tag}[^>]*\\s${attribute}=["']([^"']+)["'][^>]*>`, "i"))?.[1] ?? "");
const durationSeconds = (value: string) => {
  const parts = value.split(":").map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || undefined;
};

async function episodesFromFeeds(term: string) {
  const endpoint = new URL("https://itunes.apple.com/search");
  endpoint.searchParams.set("term", term);
  endpoint.searchParams.set("media", "podcast");
  endpoint.searchParams.set("entity", "podcast");
  endpoint.searchParams.set("country", "TH");
  endpoint.searchParams.set("limit", "6");
  const response = await fetch(endpoint, { next: { revalidate: 60 * 60 * 12 } });
  if (!response.ok) return [];
  const payload = await response.json() as { results?: AppleEpisode[] };
  const feeds = (payload.results ?? []).map(item => item.feedUrl).filter((url): url is string => !!url && /^https?:\/\//.test(url)).slice(0, 4);
  const results = await Promise.all(feeds.map(async feedUrl => {
    try {
      const feed = await fetch(feedUrl, { headers: { "user-agent": "CupOfUs/1.0 (podcast discovery)" }, next: { revalidate: 60 * 60 * 12 } });
      if (!feed.ok) return [];
      const xml = await feed.text();
      const show = xmlText(xml, "title") || "Podcast";
      const artworkUrl = xmlAttribute(xml, "itunes:image", "href") || xmlText(xml, "url");
      return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 20).map((match, index) => {
        const item = match[1];
        const audioUrl = xmlAttribute(item, "enclosure", "url");
        if (!/^https?:\/\//.test(audioUrl)) return null;
        const title = xmlText(item, "title");
        return {
          id: xmlText(item, "guid") || `${feedUrl}-${index}`,
          title,
          show,
          author: xmlText(item, "itunes:author") || xmlText(xml, "itunes:author"),
          audioUrl,
          externalUrl: xmlText(item, "link") || feedUrl,
          artworkUrl: xmlAttribute(item, "itunes:image", "href") || artworkUrl || undefined,
          publishedAt: xmlText(item, "pubDate") || undefined,
          durationSeconds: durationSeconds(xmlText(item, "itunes:duration")),
          source: "apple-rss" as const,
        };
      }).filter((episode): episode is PodcastEpisode => episode !== null);
    } catch { return []; }
  }));
  return results.flat();
}

export async function findPodcastEpisodes(title: string, author: string) {
  const term = `${title} ${author}`.trim();
  const endpoint = new URL("https://itunes.apple.com/search");
  endpoint.searchParams.set("term", term);
  endpoint.searchParams.set("media", "podcast");
  endpoint.searchParams.set("entity", "podcastEpisode");
  endpoint.searchParams.set("country", "TH");
  endpoint.searchParams.set("limit", "12");
  endpoint.searchParams.set("explicit", "No");

  const response = await fetch(endpoint, {
    headers: { "user-agent": "CupOfUs/1.0 (podcast discovery)" },
    next: { revalidate: 60 * 60 * 12 },
  });
  if (!response.ok) return episodesFromFeeds(term);
  const payload = await response.json() as { results?: AppleEpisode[] };
  const titleTokens = new Set(clean(title).split(" ").filter(token => token.length > 2));
  const authorTokens = new Set(clean(author).split(" ").filter(token => token.length > 2));

  const directEpisodes = (payload.results ?? [])
    .filter(item => item.episodeUrl?.startsWith("https://") && item.trackName)
    .map((item): PodcastEpisode & { relevance: number } => {
      const haystack = clean(`${item.trackName} ${item.collectionName} ${item.artistName}`);
      const relevance = [...titleTokens, ...authorTokens].reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
      return {
        id: String(item.trackId ?? item.episodeUrl),
        title: item.trackName ?? title,
        show: item.collectionName ?? "Podcast",
        author: item.artistName ?? "",
        audioUrl: item.episodeUrl ?? "",
        externalUrl: item.trackViewUrl ?? item.collectionViewUrl ?? `https://podcasts.apple.com/th/search?term=${encodeURIComponent(term)}`,
        artworkUrl: item.artworkUrl600,
        publishedAt: item.releaseDate,
        durationSeconds: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : undefined,
        source: "apple-rss",
        relevance,
      };
    })
    .filter(episode => episode.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)
    .map(episode => {
      const { relevance, ...playableEpisode } = episode;
      void relevance;
      return playableEpisode;
    });
  if (directEpisodes.length > 0) return directEpisodes;
  const feedEpisodes = await episodesFromFeeds(term);
  return feedEpisodes.filter(episode => {
    const haystack = clean(`${episode.title} ${episode.show} ${episode.author}`);
    return [...titleTokens, ...authorTokens].some(token => haystack.includes(token));
  }).slice(0, 5);
}
