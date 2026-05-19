import type {
    Book,
    BookFilters,
    BookshelfEntry,
    BrowseSort,
    PaginatedResponse,
} from "@/lib/gutendex"

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`)
    return res.json() as Promise<T>
}

export function getPopularBooks(page = 1): Promise<PaginatedResponse<Book>> {
    const qs = new URLSearchParams({ mode: "popular", page: String(page) })
    return fetchJson(`/api/books?${qs}`)
}

export function searchBooks(
    filters: BookFilters = {}
): Promise<PaginatedResponse<Book>> {
    const qs = new URLSearchParams({ mode: "search" })
    if (filters.page) qs.set("page", String(filters.page))
    if (filters.search) qs.set("search", filters.search)
    if (filters.topic) qs.set("topic", filters.topic)
    if (filters.sort) qs.set("sort", filters.sort)
    if (filters.languages?.length)
        qs.set("languages", filters.languages.join(","))
    if (filters.author_year_start !== undefined)
        qs.set("author_year_start", String(filters.author_year_start))
    if (filters.author_year_end !== undefined)
        qs.set("author_year_end", String(filters.author_year_end))
    return fetchJson(`/api/books?${qs}`)
}

export function getBooksByTopic(
    topic: string,
    page = 1,
    sort: BrowseSort = "popular"
): Promise<PaginatedResponse<Book>> {
    const qs = new URLSearchParams({
        mode: "topic",
        topic,
        page: String(page),
        sort,
    })
    return fetchJson(`/api/books?${qs}`)
}

export function getBookshelves(): Promise<BookshelfEntry[]> {
    const qs = new URLSearchParams({ mode: "bookshelf-list" })
    return fetchJson(`/api/books?${qs}`)
}

export function getBooksByBookshelf(
    shelf: string,
    page = 1,
    sort: BrowseSort = "popular"
): Promise<PaginatedResponse<Book>> {
    const qs = new URLSearchParams({
        mode: "bookshelf",
        shelf,
        page: String(page),
        sort,
    })
    return fetchJson(`/api/books?${qs}`)
}
