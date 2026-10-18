# Project Sonam

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Curious readers discovering classic books and understanding their ideas. This primary audience is inferred from the existing About page and adopted under the user's delegation of product and design choices. Student-specific workflows are not established.

## Product Purpose

Make free ebooks easier to discover, read, download, and understand. Success is a clear path from finding a relevant book to reading it and exploring its ideas.

## Positioning

An independent reading experience combining the Project Gutenberg catalog, an adjustable in-app reader, and a book-scoped AI reading companion.

## Operating Context

Readers browse popular books, topics, and volunteer-curated reading lists; search by title or author with topic and language filters; open details; read online or download a format. The reader supports section navigation, text search, local reading progress, adjustable preferences, focus mode, and passage questions.

## Capabilities and Constraints

- Preserve discovery, search, reading lists, book details, downloads, reading, and AI questions.
- Metadata is mirrored from Gutendex into Neon Postgres. Request-time metadata reads use the database; source text and downloads use Gutenberg URLs.
- Keep database code server-only and interactive filter state in shareable URLs.
- Book detail soft navigation opens a dialog; direct links render a full page.
- AI uses book metadata and selected passages, not the complete book. Do not imply that unsupported answers are verified.
- Reading progress and preferences are browser-local; cross-device accounts and synchronization are not established.
- The user delegated the redesign direction and routine implementation decisions.

## Brand Commitments

Keep the Project Sonam name, existing logo, source credits, and independent-project disclaimer. The project is not affiliated with, sponsored by, or officially connected to Project Gutenberg. Use clear, reader-friendly language; the AI companion is called the Librarian.

## Evidence on Hand

- Product purpose and attribution: `app/about/disclaimer/page.tsx`.
- Catalog and source metadata: `lib/gutendex.ts`, `lib/gutendex-server.ts`.
- Reader: `components/reader-shell.tsx`.
- AI limitations: `app/api/book-chat/route.ts`.
- Existing logo: `components/logo.tsx`; book covers come from catalog sources.
- No supplied testimonials, measured learning outcomes, or paid-plan claims.

## Product Principles

- Put real books and their authors at the center of discovery.
- Keep the path from discovery to reading short and understandable.
- Let AI support careful reading with clear context limits.
- Preserve original sources and honest attribution.
- Make prolonged reading comfortable across screen sizes.

## Open Decisions

No product-specific accessibility standard or additional audience requirement has been supplied. Preserve keyboard access, readable contrast, reduced-motion support, and responsive behavior as implementation requirements.
