# Cup of Us

Cup of Us is a full-stack book-discovery café: visitors answer seven questions, brew a personal cup, and receive book, coffee, podcast, music, and film pairings.

Production: https://cup-of-us.vercel.app

## What is included

- 50-book self-enrichment catalogue
- Seven-question recommendation flow
- 50 real café drink pairings
- Thai reading summaries and infographics
- Embedded YouTube summaries, Spotify tracks, and keyless podcast discovery for every book
- Film, retailer, profile, saved-cup, community, and analytics surfaces
- Cloudflare D1 schema and Drizzle migrations
- Guest-first usage; no ChatGPT login is required

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open the local URL shown in the terminal.

## Verification

```bash
npm test
npm run lint
```

## Environment variables

Copy `.env.example` to `.env.local`. Never commit real credentials.

- `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`: resolve Spotify tracks dynamically
- `TMDB_API_KEY`: retrieve film metadata
- `GOOGLE_BOOKS_API_KEY`: enrich book metadata
- `GOOGLE_PLACES_API_KEY` (or `GOOGLE_MAPS_API_KEY`): live Google Places search. Google content is requested live and is not copied into the café database.
- `ADMIN_SYNC_TOKEN`: protects the Bangkok OpenStreetMap café sync endpoint

The featured books include direct Spotify and YouTube embed IDs and work without OAuth. API credentials expand dynamic coverage.

### Podcast and background audio

Podcast playback does not use Podcast Index and does not require an API key. Each book page searches Apple Podcast Search using the exact book title and author, keeps only episodes with a direct HTTPS audio enclosure, and exposes up to five playable results. The global native audio dock remains active while visitors move between pages and integrates with the browser Media Session controls when available. Apple Podcasts, Spotify, YouTube, and audiobook links remain available as fallbacks when no verified enclosure is returned.

## Database

The D1 binding is named `DB`. Schema and seed migrations live in `drizzle/`.

Important tables:

- `books`
- `coffee_pairings`
- `media_pairings`
- `saved_cups`
- `profiles`
- `creator_posts`
- `analytics_events`
- `cafes` (500–1,000 Bangkok café records from OpenStreetMap; Google Place IDs can be stored separately)

### Bangkok café directory

After Netlify applies `0002_cafe_directory.sql`, add a long random `ADMIN_SYNC_TOKEN` in Netlify and run the importer once:

```bash
curl -X POST https://cup-of-us.vercel.app/api/cafes/sync \
  -H "Authorization: Bearer $ADMIN_SYNC_TOKEN"
```

The importer deduplicates OpenStreetMap cafés, caps the catalogue at 1,000 records, and can be run again to refresh it. `/api/cafes` reads the local directory; `/api/cafes/google` requests current Google Places data without persisting restricted Google content.

## Continue from another ChatGPT/Codex account

Read [ACCOUNT_TRANSFER.md](./ACCOUNT_TRANSFER.md). The new account must create its own Sites project and environment variables. The current `.openai/hosting.json` contains the existing Sites project ID and is not portable between owners.

## Security

- Keep the repository private while credentials and commercial plans are being prepared.
- Never commit `.env`, `.env.local`, API keys, OAuth secrets, tokens, or database exports.
- Rotate any credential previously pasted into a chat before production use.
