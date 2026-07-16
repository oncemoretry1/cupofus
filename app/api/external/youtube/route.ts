import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { books } from "../../../../db/schema";

type RuntimeEnv = { YOUTUBE_API_KEY?: string };
type SearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: { title?: string; channelTitle?: string; thumbnails?: { medium?: { url?: string } } };
  }>;
};

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return Response.json({ error:"slug required" }, { status:400 });
  const book = (await getDb().select({ title:books.title, author:books.author }).from(books).where(eq(books.slug,slug)).limit(1))[0];
  if (!book) return Response.json({ videos:[] });
  const key = (process.env as RuntimeEnv).YOUTUBE_API_KEY;
  if (!key) return Response.json({ videos:[], configured:false });
  try {
    const query = encodeURIComponent(`${book.title} ${book.author} book summary review`);
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&safeSearch=moderate&videoEmbeddable=true&videoSyndicated=true&q=${query}&key=${key}`);
    if (!response.ok) return Response.json({ videos:[], configured:true });
    const data = await response.json() as SearchResponse;
    const videos = (data.items ?? []).flatMap((item) => item.id?.videoId ? [{ id:item.id.videoId, title:item.snippet?.title ?? book.title, channel:item.snippet?.channelTitle ?? "YouTube", thumbnail:item.snippet?.thumbnails?.medium?.url ?? null }] : []);
    return Response.json({ videos, configured:true });
  } catch {
    return Response.json({ videos:[], configured:true });
  }
}
