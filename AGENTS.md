# AGENTS.md — Project Sonam

## Commands

```bash
pnpm install          # install deps
pnpm dev              # dev server (Turbopack, localhost:3000)
pnpm build            # production build
pnpm lint             # ESLint (next/core-web-vitals + typescript)
pnpm format           # Prettier (writes in-place)
pnpm typecheck        # tsc --noEmit
```

No test runner is configured. There are no tests.

## Verification order

`pnpm lint` → `pnpm typecheck` → `pnpm build`

## Architecture

- **Next.js 16** App Router with React Server Components. Client components are used only for interactivity (pagination, search forms, topic filters, theme toggle).
- **Tailwind CSS v4** — uses `@tailwindcss/postcss` (not a `tailwind.config` file). Theme lives in `app/globals.css` via CSS custom properties.
- **shadcn/ui** — `radix-sera` style, `taupe` base color, `hugeicons` icon library. Add components via `pnpm dlx shadcn add <name>`.
- **Data source**: Neon Postgres (`lib/gutendex-server.ts` reads, `app/api/sync` writes). Gutendex is upstream only — mirrored into Postgres by cron, never queried at request time.
- **Env vars required**: `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (Neon, auto-injected by Vercel Marketplace), `NVIDIA_API_KEY` (book chat), `GUTENDEX_SYNC_TOKEN` (manual sync auth), `CRON_SECRET` (auto-set by Vercel Cron).
- **Cron**: daily incremental + weekly full sync, configured in `vercel.json`, executed by `app/api/sync/route.ts`.

## Module split (must respect to keep DB out of client bundle)

| Import from | Contains | Safe in |
|---|---|---|
| `@/lib/gutendex` | Types + pure helpers (`getCoverUrl`, `formatAuthorName`, etc.) | Anywhere |
| `@/lib/gutendex-server` | `getPopularBooks`, `searchBooks`, `getBookById`, `getBooksByTopic` (DB-backed, marked `server-only`) | Server components, route handlers, scripts |
| `@/lib/gutendex-client` | Same names, but fetch `/api/books` over HTTP | Client components (`"use client"`) only |

Adding a new read path? Put the SQL in `lib/gutendex-server.ts`, expose it through `/api/books` if a client component needs it, and add a matching wrapper in `lib/gutendex-client.ts`.

## Style & formatting

- Prettier: no semicolons, double quotes, 4-space indent, trailing comma (es5).
- Tailwind class sorting via `prettier-plugin-tailwindcss` — always run `pnpm format` after editing JSX.
- No code comments in production code.

## Path alias

`@/*` → project root (`tsconfig.json` paths). Use `@/components/ui/button`, `@/lib/utils`, etc.

## Key files

| File | Purpose |
|---|---|
| `lib/gutendex.ts` | Shared types + pure helpers (client-safe) |
| `lib/gutendex-server.ts` | Postgres-backed read functions (server-only) |
| `lib/gutendex-client.ts` | Client-side fetchers hitting `/api/books` |
| `lib/db/client.ts` | Neon HTTP client (reads `DATABASE_URL`) |
| `lib/db/schema.sql` | Postgres schema — apply via `pnpm tsx scripts/apply-schema.ts` |
| `app/api/books/route.ts` | JSON read API consumed by client components |
| `app/api/sync/route.ts` | Cron-triggered Gutendex → Postgres sync |
| `vercel.json` | Cron schedule for `/api/sync` |
| `scripts/backfill-gutendex.ts` | One-off full mirror (re-runnable) |
| `lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| `app/globals.css` | Tailwind v4 theme (light/dark CSS variables) |
| `app/layout.tsx` | Root layout: fonts, theme provider, header, footer |
| `components/ui/` | shadcn/ui primitives — do not hand-edit these |
| `components.json` | shadcn/ui configuration |

## Conventions

- Server Components fetch data; Client Components handle interactivity only.
- All filter/pagination state lives in URL search params (shareable URLs).
- Book cover images use Next.js `Image` with remote patterns for `www.gutenberg.org` and `covers.openlibrary.org`.
- Dark/light theme via `next-themes`; users can toggle with the `D` key.
