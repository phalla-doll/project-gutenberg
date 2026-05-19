# Project Sonam

A modern web application for browsing, searching, and downloading free public domain ebooks. Book metadata is mirrored from the [Gutendex API](https://gutendex.com) into a Neon Postgres database; the app reads exclusively from Postgres at request time.

![Project Sonam preview](public/project-sonam-og.png)

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components, Turbopack) |
| Language | [TypeScript 5.9](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (radix-sera style, taupe base) |
| Icons | [Hugeicons](https://hugeicons.com) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) (dark/light mode, toggle with `D` key) |
| Fonts | Satoshi (body), Familjen Grotesk (headings), JetBrains Mono (code) |
| Package Manager | [pnpm](https://pnpm.io) |
| Linting | ESLint (next/core-web-vitals + typescript) |
| Formatting | Prettier + tailwindcss plugin |
| AI Provider | NVIDIA API endpoint through the OpenAI SDK |
| Database | [Neon](https://neon.tech) Postgres via Vercel Marketplace, [@neondatabase/serverless](https://www.npmjs.com/package/@neondatabase/serverless) HTTP driver |
| Data Source | [Gutendex](https://gutendex.com) (sync only — daily/weekly cron mirrors metadata into Postgres) |
| Hosting | [Vercel](https://vercel.com) (Fluid Compute, Cron Jobs) |

## Project Structure

```
project-sonam/
├── app/
│   ├── layout.tsx              # Root layout (fonts, theme, header, footer)
│   ├── page.tsx                # Home page — popular books grid
│   ├── globals.css             # Tailwind v4 + CSS variables (light/dark theme)
│   ├── home-book-grid.tsx      # Client component — home pagination
│   ├── browse/
│   │   ├── page.tsx            # Browse page — topic-based browsing
│   │   └── browse-content.tsx  # Client component — topic badges + book grid
│   ├── search/
│   │   ├── page.tsx            # Search page — query/topic/language filters
│   │   └── search-results.tsx  # Client component — search form + results
│   ├── api/
│   │   ├── book-chat/route.ts  # Streaming book assistant API
│   │   ├── books/route.ts      # JSON read API for client components (?mode=popular|search|topic)
│   │   └── sync/route.ts       # Cron-triggered Gutendex → Postgres sync
│   └── book/
│       └── [id]/
│           ├── page.tsx        # Book detail — SSR with dynamic metadata
│           └── read/page.tsx   # In-app plain text reader
├── components/
│   ├── header.tsx              # Sticky header with nav, search bar, mobile menu
│   ├── book-card.tsx           # Book card (cover, title, author, downloads)
│   ├── book-grid.tsx           # Responsive grid + skeleton loading
│   ├── pagination.tsx          # Previous/Next pagination controls
│   ├── download-links.tsx      # Download format buttons (HTML, EPUB, Kindle, etc.)
│   ├── book-chat-assistant.tsx # Floating AI assistant for book questions
│   ├── reader-toc-minimap.tsx  # Floating reader table-of-contents minimap
│   ├── logo.tsx                # Project mark
│   ├── theme-provider.tsx      # Theme provider with keyboard shortcut
│   └── ui/                     # shadcn/ui primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       └── textarea.tsx
├── hooks/
│   └── use-paginated-books.ts  # Client-side paginated fetch/cache hook
├── lib/
│   ├── book-cache.ts           # Lightweight in-memory page cache
│   ├── gutendex.ts             # Shared types + pure helpers (client-safe)
│   ├── gutendex-server.ts      # Postgres-backed read functions (server-only)
│   ├── gutendex-client.ts      # Browser fetchers that call /api/books
│   ├── db/
│   │   ├── client.ts           # Neon HTTP client (DATABASE_URL)
│   │   └── schema.sql          # Postgres schema (books, sync_runs, indexes, FTS trigger)
│   └── utils.ts                # cn() utility (clsx + tailwind-merge)
├── scripts/
│   ├── apply-schema.ts         # Apply lib/db/schema.sql to Neon
│   ├── backfill-gutendex.ts    # One-off full mirror from Gutendex
│   ├── test-queries.ts         # Smoke test the four read functions
│   └── peek.ts                 # Quick DB row sampler
├── public/
├── next.config.mjs
├── vercel.json                 # Cron jobs (daily incremental + weekly full sync)
├── eslint.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── components.json             # shadcn/ui config
├── package.json
└── pnpm-lock.yaml
```

## Pages & Routes

### `/` — Home
Displays the most downloaded books in a responsive grid with infinite loading, duplicate filtering, cached pages, skeleton states, and a retry action for failed page loads.

### `/browse` — Browse by Topic
Browse books across 20 curated topics (Fiction, Science Fiction, Fantasy, Mystery, Romance, Adventure, History, Philosophy, Science, Poetry, and more). Topic selection via badge filters.

### `/search` — Search Books
Full-text search with filters:
- **Query** — search by title or author
- **Topic** — filter by subject (12 topics)
- **Language** — filter by language (English, French, German, Spanish, Italian, Portuguese, Chinese, Japanese)

### `/book/[id]` — Book Detail
Server-rendered book detail page with:
- Cover image (from Gutenberg CDN)
- Author info with birth/death years
- In-app reader link when a plain text edition is available
- External original reader fallback when only HTML is available
- Download links in multiple formats (HTML, EPUB, Kindle, Plain Text, ZIP, and other non-image formats)
- Book summary, subjects, bookshelves, and translators
- Floating AI assistant for concise questions about the current book
- Dynamic SEO metadata via `generateMetadata`

### `/book/[id]/read` — Reader
Server-rendered reading view that fetches the book's plain text edition, removes source boilerplate, detects likely chapter/section headings, and renders a readable long-form layout with an optional table-of-contents minimap. Readers can highlight a passage and ask the AI assistant about that selection. If plain text is unavailable, it offers a link to the original HTML edition when possible.

### `/api/book-chat` — Book Assistant
Streams concise, book-scoped assistant responses for the detail and reader pages. The route:

- Uses the OpenAI SDK with NVIDIA's OpenAI-compatible API endpoint
- Requires `NVIDIA_API_KEY`
- Loads the selected book from Postgres and builds a constrained system prompt from its metadata
- Accepts recent user/assistant chat history plus optional selected passage text
- Returns a plain text streaming response with `Cache-Control: no-store`

### `/api/books` — Client read API
JSON proxy used by client components (home grid, search results, browse list). Query params: `?mode=popular|search|topic&page=...&search=...&topic=...&languages=en,fr&sort=...`. Same `PaginatedResponse<Book>` shape Gutendex returned, so the response contract is unchanged from the previous architecture.

### `/api/sync` — Gutendex → Postgres sync
Cron-triggered route that pulls metadata from Gutendex and upserts into Postgres. Two modes:

- `?mode=incremental` (daily, 04:00 UTC) — re-scans the first ~50 popular pages to catch new books and download-count changes
- `?mode=full` (weekly, Sun 05:00 UTC) — full walk of all ~75k books

Authentication accepts either `Authorization: Bearer ${CRON_SECRET}` (auto-set by Vercel Cron) or `Authorization: Bearer ${GUTENDEX_SYNC_TOKEN}` for manual triggers. Each run is logged to the `sync_runs` table.

## Data Layer

Book metadata lives in a single denormalized `books` table in Neon Postgres. The schema (`lib/db/schema.sql`) uses:

- `JSONB` for `authors`, `translators`, and `formats`
- `TEXT[]` for `subjects`, `bookshelves`, `languages`, `summaries`
- GIN indexes on the text arrays for fast `@>` / `&&` filters
- A `tsvector` column over title + author names, kept up to date by a trigger, indexed for full-text search via `websearch_to_tsquery`
- A `sync_runs` table for cron observability

### Read functions

The four read functions are split across two modules so the Neon client never leaks into the browser bundle:

| Function | Module | Used by |
| --- | --- | --- |
| `getPopularBooks(page)` | `lib/gutendex-server.ts` | Server pages, `/api/books` |
| `searchBooks(filters)` | `lib/gutendex-server.ts` | Server pages, `/api/books` |
| `getBooksByTopic(topic, page, sort)` | `lib/gutendex-server.ts` | Server pages, `/api/books` |
| `getBookById(id)` | `lib/gutendex-server.ts` | Server pages, `/api/book-chat` |
| `getPopularBooks`, `searchBooks`, `getBooksByTopic` | `lib/gutendex-client.ts` | Client components — call `/api/books` over fetch |

`lib/gutendex.ts` itself contains only types (`Book`, `Person`, `PaginatedResponse`, `BookFilters`, `BrowseSort`) and pure helpers (`getCoverUrl`, `getReadableTextUrl`, `getOnlineReadUrl`, `getFormatLabel`, `formatAuthorName`, `formatDownloadCount`) and is safe to import from anywhere.

### What still hits gutenberg.org directly

Cover images, the reader's plain-text content, and download links (EPUB, Kindle, HTML, etc.) are direct URLs stored as strings in `formats`. They're served straight from Gutenberg's static asset CDN — we do not mirror book text.

### TypeScript Types

```ts
interface Book {
  id: number
  title: string
  authors: Person[]
  summaries: string[]
  translators: Person[]
  subjects: string[]
  bookshelves: string[]
  languages: string[]
  copyright: boolean | null
  media_type: string
  formats: Record<string, string>
  download_count: number
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
```

### Caching Strategy

- **Reads** — every list/search/detail query hits Postgres directly via the Neon HTTP driver. Typical TTFB is sub-200 ms.
- **Reader text** — fetched from Gutenberg with `revalidate: 86400` (24 h).
- **Book chat** — no-store streaming response; book metadata comes from Postgres.
- **Client navigation** — `lib/book-cache.ts` is a session-scoped in-memory dedup so paginated client-side loads don't re-fetch already-seen pages.
- **Freshness** — daily incremental sync at 04:00 UTC, weekly full sync Sunday 05:00 UTC.

## Key Features

- **Responsive design** — 2-column mobile to 6-column desktop grid
- **Infinite feeds** — popular and topic pages load more books as the user scrolls
- **In-app reader** — plain text editions are parsed into readable sections with a minimap table of contents
- **Book-scoped AI assistant** — ask about a book from the detail page or highlight reader text for passage-specific questions
- **Dark/light mode** — system-aware with manual toggle (press `D`)
- **Skeleton loading and retries** — graceful loading/error states for paginated client fetches
- **URL-based state** — all filters and pagination reflected in query params for shareable URLs
- **Image optimization** — Next.js `Image` with remote patterns for Gutenberg CDN
- **Mobile navigation** — sheet-based slide-out menu on small screens
- **Server Components** — data fetching on the server, client components only for interactivity

## Getting Started

### Prerequisites

- Node.js 20 or newer
- pnpm

### Environment

A linked Neon Postgres database is required for all read paths. Provision via Vercel Marketplace (Storage → Create → Neon Postgres), then pull the connection strings locally:

```bash
vercel env pull .env.local
```

This injects (among others):

```bash
DATABASE_URL=...           # pooled connection used by the app
DATABASE_URL_UNPOOLED=...  # direct connection used by scripts/cron
```

You also need:

```bash
NVIDIA_API_KEY=...           # AI book assistant
GUTENDEX_SYNC_TOKEN=...      # bearer token for manual sync triggers (Vercel Cron uses CRON_SECRET automatically)
```

### Install

```bash
pnpm install
```

### Database setup (first time only)

```bash
# 1. Apply schema to Neon (idempotent — uses IF NOT EXISTS)
pnpm tsx scripts/apply-schema.ts

# 2. Backfill ~75k books from Gutendex (takes 2–4 hours, can be re-run safely)
pnpm tsx scripts/backfill-gutendex.ts

# 3. Sanity check
pnpm tsx scripts/peek.ts
pnpm tsx scripts/test-queries.ts
```

After deployment, the daily/weekly cron in `vercel.json` keeps the mirror fresh automatically.

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
pnpm build
```

### Lint & Format

```bash
pnpm lint
pnpm typecheck
pnpm format
```

For a production confidence check, run:

```bash
pnpm lint
pnpm typecheck
pnpm build
```
