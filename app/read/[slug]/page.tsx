import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../../db";
import { books } from "../../../db/schema";
import ReadBookClient, { type ReadBook } from "./ReadBookClient";

export const dynamic = "force-dynamic";

export default async function DynamicReadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = (
    await getDb().select().from(books).where(eq(books.slug, slug)).limit(1)
  )[0];

  if (!book) notFound();

  const readableBook: ReadBook = {
    slug: book.slug,
    title: book.title,
    thaiTitle: book.thaiTitle ?? undefined,
    author: book.author,
    summary: book.summary,
    tags: book.tags,
    concerns: book.concerns,
    personality: book.personality,
    readingMinutes: book.readingMinutes,
    coverColor: book.coverColor,
  };

  return <ReadBookClient book={readableBook} />;
}
