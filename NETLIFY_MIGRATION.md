# Cup of Us · Netlify migration

This branch converts Cup of Us from Vinext/Cloudflare D1 to native Next.js on Netlify with Netlify Database (Postgres).

## What is ready

- Native `next build`, App Router, API routes, SSR and PWA files.
- Drizzle Postgres schema for catalog, profiles, saved cups, community, analytics and authentication.
- Automatic Netlify migrations and seed data for 50 books, 50 coffee pairings and media pairings.
- Runtime environment access through `process.env`.
- Google/Apple OAuth, Resend, Spotify, YouTube, Google Books and TMDB remain server-side.

## Connect and preview

1. Push `codex/netlify-migration` to a GitHub repository.
2. In Netlify, select **Add new project → Import an existing project** and choose that repository/branch.
3. Netlify reads `netlify.toml`: build command `pnpm build`, publish directory `.next`, Node 22.
4. Create Netlify Database for the project. Migrations under `netlify/database/migrations` run during deploy.
5. Add the values listed in `.env.example` to **Project configuration → Environment variables** and mark secrets as sensitive.
6. Register the preview callbacks with the identity providers:
   - Google: `https://YOUR-SITE.netlify.app/api/auth/oauth/google/callback`
   - Apple: `https://YOUR-SITE.netlify.app/api/auth/oauth/apple/callback`
7. Verify `/api/books`, guest brew, save-cup login, OAuth, email recovery and media players on a Deploy Preview.

## Safe production cutover

Keep the existing public site live while the Netlify preview is tested. Export D1 user/profile/saved-cup data, import it into Postgres, briefly freeze writes, perform a final delta import, then move the custom domain. Do not reuse exposed or previously pasted secrets; rotate them before adding production environment variables.
