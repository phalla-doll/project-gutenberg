# Project Sonam

A modern web application for browsing, searching, and downloading free public domain ebooks, powered by the [Gutendex API](https://gutendex.com).

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
│   │   └── book-chat/route.ts  # Streaming book assistant API
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
- Fetches the selected book from Gutendex and builds a constrained system prompt from its metadata
- Accepts recent user/assistant chat history plus optional selected passage text
- Returns a plain text streaming response with `Cache-Control: no-store`

## API Integration

All data comes from the [Gutendex API](https://gutendex.com) (`lib/gutendex.ts`):

| Function | Endpoint | Description |
| --- | --- | --- |
| `getPopularBooks(page)` | `GET /books?sort=popular` | Paginated popular books |
| `searchBooks(filters)` | `GET /books?search=...&topic=...` | Search with filters |
| `getBookById(id)` | `GET /books/{id}` | Single book by ID |
| `getBooksByTopic(topic, page)` | `GET /books?topic=...` | Books by topic |

Utility helpers in the same module normalize cover URLs, readable text URLs, online reader URLs, author names, format labels, and download counts.

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
- **Reader text** — revalidated every **24 hours** (`revalidate: 86400`)
- **Book chat** — no-store streaming response; book metadata still uses the cached Gutendex helper
- **Client navigation** — in-memory page caching avoids refetching already loaded home, browse, and search pages during a session

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

The browsing, search, detail, and reader experiences work with the public Gutendex API and do not require local environment variables.

The AI book assistant requires:

```bash
NVIDIA_API_KEY=...
```

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
pnpm typecheck
pnpm format
```

For a production confidence check, run:

```bash
pnpm lint
pnpm typecheck
pnpm build
```
