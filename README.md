# Project Gutenberg

A modern web application for browsing, searching, and downloading free public domain ebooks from [Project Gutenberg](https://www.gutenberg.org), powered by the [Gutendex API](https://gutendex.com).

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components, Turbopack) |
| Language | [TypeScript 5.9](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (radix-sera style, taupe base) |
| Icons | [Hugeicons](https://hugeicons.com) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) (dark/light mode, toggle with `D` key) |
| Fonts | DM Sans (body), Merriweather (headings), Geist Mono (code) |
| Package Manager | [pnpm](https://pnpm.io) |
| Linting | ESLint (next/core-web-vitals + typescript) |
| Formatting | Prettier + tailwindcss plugin |

## Project Structure

```
project-gutenberg/
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
│   └── book/
│       └── [id]/
│           └── page.tsx        # Book detail — SSR with dynamic metadata
├── components/
│   ├── header.tsx              # Sticky header with nav, search bar, mobile menu
│   ├── book-card.tsx           # Book card (cover, title, author, downloads)
│   ├── book-grid.tsx           # Responsive grid + skeleton loading
│   ├── pagination.tsx          # Previous/Next pagination controls
│   ├── download-links.tsx      # Download format buttons (HTML, EPUB, Kindle, etc.)
│   ├── theme-provider.tsx      # Theme provider with keyboard shortcut
│   └── ui/                     # shadcn/ui primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       └── tabs.tsx
├── lib/
│   ├── gutendex.ts             # Gutendex API client + TypeScript types
│   └── utils.ts                # cn() utility (clsx + tailwind-merge)
├── public/
├── next.config.mjs
├── eslint.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── components.json             # shadcn/ui config
├── package.json
└── pnpm-lock.yaml
```

## Pages & Routes

### `/` — Home
Displays the most downloaded books from Project Gutenberg in a responsive grid with pagination.

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
- Download links in multiple formats (HTML, EPUB, Kindle, Plain Text, ZIP)
- Book summary, subjects, bookshelves, and translators
- Dynamic SEO metadata via `generateMetadata`

## API Integration

All data comes from the [Gutendex API](https://gutendex.com) (`lib/gutendex.ts`):

| Function | Endpoint | Description |
| --- | --- | --- |
| `getPopularBooks(page)` | `GET /books?sort=popular` | Paginated popular books |
| `searchBooks(filters)` | `GET /books?search=...&topic=...` | Search with filters |
| `getBookById(id)` | `GET /books/{id}` | Single book by ID |
| `getBooksByTopic(topic, page)` | `GET /books?topic=...` | Books by topic |

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

### Caching Strategy (ISR)

- **Book lists** — revalidated every **1 hour** (`revalidate: 3600`)
- **Book details** — revalidated every **24 hours** (`revalidate: 86400`)

## Key Features

- **Responsive design** — 2-column mobile to 6-column desktop grid
- **Dark/light mode** — system-aware with manual toggle (press `D`)
- **Skeleton loading** — graceful loading states for all data fetches
- **URL-based state** — all filters and pagination reflected in query params for shareable URLs
- **Image optimization** — Next.js `Image` with remote patterns for Gutenberg CDN
- **Mobile navigation** — sheet-based slide-out menu on small screens
- **Server Components** — data fetching on the server, client components only for interactivity

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm

### Install

```bash
pnpm install
```

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
pnpm format
pnpm typecheck
```
