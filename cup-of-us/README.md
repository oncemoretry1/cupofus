# Cup of Us

Cup of Us is a full-stack book-discovery café: visitors answer seven questions, brew a personal cup, and receive book, coffee, podcast, music, and film pairings.

Production: https://between-the-lines-th.graphgent-sora.chatgpt.site

## What is included

- 50-book self-enrichment catalogue
- Seven-question recommendation flow
- 50 real café drink pairings
- Thai reading summaries and infographics
- Embedded YouTube summaries and Spotify tracks for featured books
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
- `GOOGLE_MAPS_API_KEY`: future nearby-café integration

The featured eight books include direct Spotify and YouTube embed IDs and work without OAuth. API credentials expand dynamic coverage.

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

## Continue from another ChatGPT/Codex account

Read [ACCOUNT_TRANSFER.md](./ACCOUNT_TRANSFER.md). The new account must create its own Sites project and environment variables. The current `.openai/hosting.json` contains the existing Sites project ID and is not portable between owners.

## Security

- Keep the repository private while credentials and commercial plans are being prepared.
- Never commit `.env`, `.env.local`, API keys, OAuth secrets, tokens, or database exports.
- Rotate any credential previously pasted into a chat before production use.
