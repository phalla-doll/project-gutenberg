import "server-only"
import { sql } from "@/lib/db/client"
import type {
    Book,
    BookFilters,
    BrowseSort,
    PaginatedResponse,
    Person,
} from "@/lib/gutendex"

const PAGE_SIZE = 36

type BookRow = {
    id: number
    title: string
    authors: Person[]
    translators: Person[]
    subjects: string[]
    bookshelves: string[]
    languages: string[]
    summaries: string[]
    copyright: boolean | null
    media_type: string
    formats: Record<string, string>
    download_count: number
}

function rowToBook(row: BookRow): Book {
    return {
        id: row.id,
        title: row.title,
        authors: row.authors ?? [],
        translators: row.translators ?? [],
        subjects: row.subjects ?? [],
        bookshelves: row.bookshelves ?? [],
        languages: row.languages ?? [],
        summaries: row.summaries ?? [],
        copyright: row.copyright,
        media_type: row.media_type,
        formats: row.formats ?? {},
        download_count: row.download_count ?? 0,
    }
}

function paginated(
    rows: BookRow[],
    count: number,
    page: number
): PaginatedResponse<Book> {
    const results = rows.map(rowToBook)
    const offset = (page - 1) * PAGE_SIZE
    return {
        count,
        next: offset + rows.length < count ? `?page=${page + 1}` : null,
        previous: page > 1 ? `?page=${page - 1}` : null,
        results,
    }
}

export async function getPopularBooks(
    page = 1
): Promise<PaginatedResponse<Book>> {
    const offset = (page - 1) * PAGE_SIZE
    const rows = (await sql`
        SELECT id, title, authors, translators, subjects, bookshelves,
               languages, summaries, copyright, media_type, formats, download_count
        FROM books
        ORDER BY download_count DESC, id ASC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `) as BookRow[]
    const [{ count }] = (await sql`
        SELECT count(*)::int AS count FROM books
    `) as { count: number }[]
    return paginated(rows, count, page)
}

export async function searchBooks(
    filters: BookFilters = {}
): Promise<PaginatedResponse<Book>> {
    const {
        page = 1,
        search,
        languages,
        topic,
        author_year_start,
        author_year_end,
        sort = "popular",
    } = filters
    const offset = (page - 1) * PAGE_SIZE
    const langs = languages?.length ? languages : null
    const topicVal = topic && topic.length ? topic : null
    const searchVal = search && search.length ? search : null
    const orderBy =
        sort === "ascending"
            ? sql`ORDER BY id ASC`
            : sort === "descending"
              ? sql`ORDER BY id DESC`
              : sql`ORDER BY download_count DESC, id ASC`

    const rows = (await sql`
        SELECT id, title, authors, translators, subjects, bookshelves,
               languages, summaries, copyright, media_type, formats, download_count
        FROM books
        WHERE
            (${searchVal}::text IS NULL OR search_tsv @@ websearch_to_tsquery('english', ${searchVal}))
            AND (${langs}::text[] IS NULL OR languages && ${langs}::text[])
            AND (${topicVal}::text IS NULL OR ${topicVal} ILIKE ANY(subjects) OR ${topicVal} ILIKE ANY(bookshelves))
            AND (${author_year_start ?? null}::int IS NULL OR EXISTS (
                SELECT 1 FROM jsonb_array_elements(authors) a
                WHERE (a->>'birth_year')::int >= ${author_year_start ?? null}::int
            ))
            AND (${author_year_end ?? null}::int IS NULL OR EXISTS (
                SELECT 1 FROM jsonb_array_elements(authors) a
                WHERE (a->>'death_year')::int <= ${author_year_end ?? null}::int
            ))
        ${orderBy}
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `) as BookRow[]

    const [{ count }] = (await sql`
        SELECT count(*)::int AS count FROM books
        WHERE
            (${searchVal}::text IS NULL OR search_tsv @@ websearch_to_tsquery('english', ${searchVal}))
            AND (${langs}::text[] IS NULL OR languages && ${langs}::text[])
            AND (${topicVal}::text IS NULL OR ${topicVal} ILIKE ANY(subjects) OR ${topicVal} ILIKE ANY(bookshelves))
            AND (${author_year_start ?? null}::int IS NULL OR EXISTS (
                SELECT 1 FROM jsonb_array_elements(authors) a
                WHERE (a->>'birth_year')::int >= ${author_year_start ?? null}::int
            ))
            AND (${author_year_end ?? null}::int IS NULL OR EXISTS (
                SELECT 1 FROM jsonb_array_elements(authors) a
                WHERE (a->>'death_year')::int <= ${author_year_end ?? null}::int
            ))
    `) as { count: number }[]

    return paginated(rows, count, page)
}

export async function getBookById(id: number): Promise<Book> {
    const rows = (await sql`
        SELECT id, title, authors, translators, subjects, bookshelves,
               languages, summaries, copyright, media_type, formats, download_count
        FROM books WHERE id = ${id}
    `) as BookRow[]
    if (rows.length === 0) throw new Error(`Book ${id} not found`)
    return rowToBook(rows[0])
}

export async function getBooksByTopic(
    topic: string,
    page = 1,
    sort: BrowseSort = "popular"
): Promise<PaginatedResponse<Book>> {
    const offset = (page - 1) * PAGE_SIZE
    const orderBy =
        sort === "descending"
            ? sql`ORDER BY id DESC`
            : sql`ORDER BY download_count DESC, id ASC`
    const rows = (await sql`
        SELECT id, title, authors, translators, subjects, bookshelves,
               languages, summaries, copyright, media_type, formats, download_count
        FROM books
        WHERE ${topic} ILIKE ANY(subjects) OR ${topic} ILIKE ANY(bookshelves)
        ${orderBy}
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `) as BookRow[]
    const [{ count }] = (await sql`
        SELECT count(*)::int AS count FROM books
        WHERE ${topic} ILIKE ANY(subjects) OR ${topic} ILIKE ANY(bookshelves)
    `) as { count: number }[]
    return paginated(rows, count, page)
}
