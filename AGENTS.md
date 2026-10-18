# AGENTS.md — Project Sonam

## Commands

```bash
pnpm install          # install deps
pnpm dev              # dev server (Turbopack, localhost:3000)
pnpm build            # production build
pnpm lint             # ESLint (next/core-web-vitals + typescript)
pnpm format           # Prettier (writes in-place)
pnpm typecheck        # tsc --noEmit
pnpm preview          # build + run on the Cloudflare Workers runtime locally
pnpm run deploy       # build + deploy to Cloudflare Workers (sets cron triggers)
```

No test runner is configured. There are no tests.

## Verification order

`pnpm lint` → `pnpm typecheck` → `pnpm build`

## Architecture

- **Next.js 16** App Router with React Server Components. Client components are used only for interactivity (pagination, search forms, topic filters, theme toggle, book chat).
- **Tailwind CSS v4** — uses `@tailwindcss/postcss` (not a `tailwind.config` file). Theme lives in `app/globals.css` via CSS custom properties.
- **shadcn/ui** — `radix-sera` style, `taupe` base color, `hugeicons` icon library. Add components via `pnpm dlx shadcn add <name>`. `dialog.tsx` and `popover.tsx` were written by hand because the CLI tried to overwrite `button.tsx` and add an unrelated `cn` dependency.
- **Fonts**: `Satoshi` (body) and `Familjen Grotesk` (headings) loaded from Fontshare via `<link>` in layout; `JetBrains Mono` and `EB Garamond` (italic, page subtitles) via `next/font/google`. Custom properties: `--font-sans`, `--font-heading`, `--font-mono`, `--font-serif`.
- **Images**: `images.unoptimized: true` in `next.config.mjs`. Remote patterns allow `www.gutenberg.org/cache/epub/**` and `covers.openlibrary.org`.
- **Data source**: Neon Postgres (`lib/gutendex-server.ts` reads, `app/api/sync` writes). Gutendex is upstream only — mirrored into Postgres by cron, never queried at request time.
- **Book chat**: `app/api/book-chat/route.ts` uses the OpenAI SDK pointed at NVIDIA's API (`https://integrate.api.nvidia.com/v1`). Explicit `runtime = "nodejs"` (streaming).
- **Book dialog**: soft navigation to `/book/[id]` is intercepted by `app/@modal/(.)book/[id]` and opens `components/book-dialog.tsx`; direct loads and refreshes render the full `app/book/[id]/page.tsx`. Both render `components/book-detail.tsx`. `app/@modal/page.tsx` and `app/@modal/[...catchAll]/page.tsx` return `null` so the dialog closes on any other navigation — keep them when adding routes.
- **Page headings**: Home, Browse, Reading Lists and Search use `components/page-heading.tsx` — Familjen Grotesk headings with Satoshi descriptions. No numbered marks or simulated wooden signs.
- **Catalog grid**: `components/book-grid.tsx` + `components/book-card.tsx` render two columns on phones, three at sm, four at lg, and five at xl. Each cover is a dimensional `components/book-jacket.tsx` inside a lilac or peach 4:5 field with its title and author below. The home opening links three actual popular books in a layered display. `components/book-card-2.tsx` exports the interactive 3D `Book` used only by book details. Visual tokens live in `app/globals.css`; `DESIGN.md` documents the plum/lilac exhibition system.
- **Reader**: `app/book/[id]/read/page.tsx` with `components/reader-shell.tsx` and `components/reader-toc-minimap.tsx`. When `body[data-reader-focus="true"]`, header and footer are hidden via CSS.
- **Analytics**: Google Analytics via `@next/third-parties/google`. Client helper in `lib/analytics.ts`.

## Env vars

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres (pooled, used by `lib/db/client.ts`) |
| `DATABASE_URL_UNPOOLED` | Neon Postgres (direct, used by sync script) |
| `NVIDIA_API_KEY` | Book chat LLM endpoint |
| `GUTENDEX_SYNC_TOKEN` | Manual sync auth (`/api/sync`) |
| `CRON_SECRET` | Bearer token used by the cron `scheduled()` handler in `custom-worker.ts` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID |

`next build` reads `.env.local`; the Worker runtime reads `.dev.vars` (local) / `wrangler secret put` (prod). Cron: daily incremental + weekly full sync, configured as Cloudflare cron triggers in `wrangler.jsonc`.

## Module split (must respect to keep DB out of client bundle)

| Import from | Contains | Safe in |
|---|---|---|
| `@/lib/gutendex` | Types + pure helpers (`getCoverUrl`, `formatAuthorName`, etc.) | Anywhere |
| `@/lib/gutendex-server` | `getPopularBooks`, `searchBooks`, `getBookById`, `getBooksByTopic` (DB-backed, imports `server-only`) | Server components, route handlers, scripts |
| `@/lib/gutendex-client` | Same names, but fetch `/api/books` over HTTP | Client components (`"use client"`) only |
| `@/lib/analytics` | `trackEvent` — GA event helper (`"use client"`) | Client components only |

Adding a new read path? Put the SQL in `lib/gutendex-server.ts`, expose it through `/api/books` if a client component needs it, and add a matching wrapper in `lib/gutendex-client.ts`.

## Style & formatting

- Prettier: no semicolons, double quotes, 4-space indent, trailing comma (es5), `printWidth: 80`.
- Tailwind class sorting via `prettier-plugin-tailwindcss` — always run `pnpm format` after editing JSX.
- No code comments in production code.

## Path alias

`@/*` → project root (`tsconfig.json` paths). Use `@/components/ui/button`, `@/lib/utils`, etc.

## Key files

| File | Purpose |
|---|---|
| `next.config.mjs` | Image remote patterns, `unoptimized: true` |
| `lib/gutendex.ts` | Shared types + pure helpers (client-safe) |
| `lib/gutendex-server.ts` | Postgres-backed read functions (server-only) |
| `lib/gutendex-client.ts` | Client-side fetchers hitting `/api/books` |
| `lib/db/client.ts` | Neon HTTP client (reads `DATABASE_URL`) |
| `lib/db/schema.sql` | Postgres schema — apply via `pnpm tsx scripts/apply-schema.ts` |
| `lib/site-metadata.ts` | Site name, URL, OG image constants |
| `lib/analytics.ts` | GA event helper (client-only) |
| `lib/book-cache.ts` | In-memory `Map` cache for book pages (server-side) |
| `lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| `app/globals.css` | Tailwind v4 theme: CSS variables, custom font/theme tokens, dark mode |
| `app/layout.tsx` | Root layout: fonts, GA script, header, footer |
| `app/api/books/route.ts` | JSON read API consumed by client components |
| `app/api/book-chat/route.ts` | LLM chat endpoint (NVIDIA/OpenAI SDK, streaming, nodejs runtime) |
| `app/api/sync/route.ts` | Cron-triggered Gutendex → Postgres sync |
| `wrangler.jsonc` | Cloudflare Worker config: bindings, R2 cache, cron triggers |
| `open-next.config.ts` | OpenNext adapter config (R2 incremental cache) |
| `custom-worker.ts` | Worker entry: Next.js fetch handler + cron `scheduled()` → `/api/sync` |
| `scripts/backfill-gutendex.ts` | One-off full mirror (re-runnable) |
| `scripts/apply-schema.ts` | Apply `schema.sql` to Neon |
| `components/ui/` | shadcn/ui primitives — do not hand-edit these |

## Conventions

- Server Components fetch data; Client Components handle interactivity only.
- All filter/pagination state lives in URL search params (shareable URLs).
- Book cover images use Next.js `Image` with remote patterns for `www.gutenberg.org` and `covers.openlibrary.org`.
- Dark/light theme via `next-themes`; users can toggle with the `D` key.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
