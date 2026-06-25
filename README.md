# New Community Bible — Web (Next.js)

Full rebuild of the NCB platform: public Bible reader (testaments → books →
chapters → verses) with cross-references, footnotes, commentary, lexicon,
bookmarks, search, dark mode, and font-size control — plus a login-protected
admin panel. Built with Next.js + Prisma, deployed on Vercel with a Turso
(hosted SQLite) database.

## Build from scratch

Requires Node 18+.

```bash
# 1. install dependencies
npm install

# 2. create .env (see below) with your Turso + auth values

# 3. generate the Prisma client
npx prisma generate

# 4. run locally
npm run dev          # http://localhost:3000
```

### .env file (create this in the project root)

```
DATABASE_URL="libsql://ncb-prod-itadminstpauls.aws-ap-south-1.turso.io"
DATABASE_AUTH_TOKEN="your-turso-token"
NEXTAUTH_SECRET="any-long-random-string"     # generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"         # locally; your site URL in production
```

Your data already lives on Turso, so no import is needed to run. (To load a
fresh dump into a new database, see the import script below.)

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo in Vercel.
3. Set the four env vars above in Vercel → Settings → Environment Variables
   (set NEXTAUTH_URL to your deployed URL).
4. Deploy. Build command is `prisma generate && next build` (already configured).

## Loading data (only for a fresh database)

```bash
DATABASE_URL="file:./prisma/dev.db" npx prisma db push
DATABASE_URL="file:./prisma/dev.db" npm run import:sqlite -- /path/to/bettery1_ncb_clean.sqlite
```

For Turso, set DATABASE_URL/DATABASE_AUTH_TOKEN to the Turso values instead.

## Gill Sans font

Drop licensed font files at `public/fonts/GillSans.woff2` and
`public/fonts/GillSans-Bold.woff2`. The CSS picks them up automatically;
until then it falls back to a similar sans-serif.

## Structure
```
prisma/schema.prisma            data model (maps to existing table names)
scripts/import-from-sqlite.mjs  data importer
src/lib/                        prisma client, auth config, api helpers
src/app/(public)                home, /read/[chapterId], /search, /lexicon, /bookmarks
src/app/admin/*                 dashboard, content, cross-references, lexicons, pages, users, banner
src/app/api/*                   JSON API
src/components/*                client components (settings, bookmarks, cross-ref panel, etc.)
src/middleware.ts               protects /admin behind login
```

## Features
- Reading with verse numbers, headings, inline commentary
- Cross-reference icon (↦) on linked verses → slide-in panel of related verses
- Full-text search, lexicon, static pages
- Bookmarks + share (stored per-browser)
- Light / dark mode, adjustable text size
- Admin: full CRUD for all content + admin users

## v2 redesign notes
This version adds: splash screen, bottom tab bar (flat icons), mobile slide-out
menu, modern themed UI, smooth animations, interactive live search with voice
input, chapter audio player (slide-up), and bookmark grouping.

### One-time DB step for chapter audio
The schema added a `chapters.audio_url` column. Apply it to your database once:
```bash
DATABASE_URL="libsql://...turso.io" DATABASE_AUTH_TOKEN="..." npx prisma db push
```
This is non-destructive (adds a nullable column). Audio files: paste a URL in the
admin chapter editor for now; wire Vercel Blob upload in a later pass.

### Voice search
Uses the browser Web Speech API — works in Chrome/Edge, partial in Safari, and
through the device engine in the eventual native apps. The mic button only shows
when supported.
