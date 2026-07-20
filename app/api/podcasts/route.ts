import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { books } from "../../../db/schema";
import { findPodcastEpisodes } from "../../../lib/podcast-discovery";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return Response.json({ error: "slug required", episodes: [] }, { status: 400 });
  const book = (await getDb().select({ title: books.title, author: books.author }).from(books).where(eq(books.slug, slug)).limit(1))[0];
  if (!book) return Response.json({ episodes: [], source: "not-found" }, { status: 404 });
  try {
    const episodes = await findPodcastEpisodes(book.title, book.author);
    return Response.json({
      episodes,
      source: "apple-rss",
      keyless: true,
      query: `${book.title} ${book.author}`,
      appleSearchUrl: `https://podcasts.apple.com/th/search?term=${encodeURIComponent(`${book.title} ${book.author}`)}`,
    });
  } catch {
    return Response.json({
      episodes: [],
      source: "fallback",
      keyless: true,
      appleSearchUrl: `https://podcasts.apple.com/th/search?term=${encodeURIComponent(`${book.title} ${book.author}`)}`,
    });
  }
}
