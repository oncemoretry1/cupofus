type CatalogBook = {
  title: string;
  author: string;
  audioUrl?: string | null;
  podcastUrl?: string | null;
  kinokuniyaUrl?: string | null;
  shopeeUrl?: string | null;
  lazadaUrl?: string | null;
  naiinUrl?: string | null;
};

const exactQuery = (book: CatalogBook) => `${book.title} ${book.author}`.trim();

/**
 * Keep every catalog entry usable even while a direct product page is being
 * editorially verified. Fallbacks always carry title + author and never point
 * at a retailer home page, so a user is not dropped into an unrelated shelf.
 */
export function withCatalogLinks<T extends CatalogBook>(book: T) {
  const query = exactQuery(book);
  return {
    ...book,
    audioUrl: book.audioUrl || `https://www.audible.com/search?keywords=${encodeURIComponent(query)}`,
    podcastUrl: book.podcastUrl || `https://open.spotify.com/search/${encodeURIComponent(`${query} podcast`)}`,
    kinokuniyaUrl: book.kinokuniyaUrl || `https://www.kinokuniya.co.th/search/${encodeURIComponent(query)}`,
    shopeeUrl: book.shopeeUrl || `https://shopee.co.th/search?keyword=${encodeURIComponent(query)}`,
    lazadaUrl: book.lazadaUrl || `https://www.lazada.co.th/catalog/?q=${encodeURIComponent(query)}`,
    naiinUrl: book.naiinUrl || `https://www.naiin.com/search-result?keyword=${encodeURIComponent(query)}`,
    podcastSearchUrl: `https://podcasts.apple.com/th/search?term=${encodeURIComponent(query)}`,
  };
}

