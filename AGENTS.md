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
- **Data source**: Gutendex API (`lib/gutendex.ts`). No database, no env vars, no API keys.
- **ISR caching**: book lists revalidated every 1h, book details every 24h.

## Style & formatting

- Prettier: no semicolons, double quotes, 4-space indent, trailing comma (es5).
- Tailwind class sorting via `prettier-plugin-tailwindcss` — always run `pnpm format` after editing JSX.
- No code comments in production code.

## Path alias

`@/*` → project root (`tsconfig.json` paths). Use `@/components/ui/button`, `@/lib/utils`, etc.

## Key files

| File | Purpose |
|---|---|
| `lib/gutendex.ts` | API client + TypeScript types (Book, PaginatedResponse) |
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
