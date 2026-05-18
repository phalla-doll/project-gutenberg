const BASE_URL = "https://gutendex.com"

export interface Person {
    name: string
    birth_year: number | null
    death_year: number | null
}

export interface Book {
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

export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}

export interface BookFilters {
    page?: number
    search?: string
    languages?: string[]
    topic?: string
    author_year_start?: number
    author_year_end?: number
    sort?: "popular" | "ascending" | "descending"
    ids?: number[]
}

async function fetchWithRetry(
    url: string,
    init: RequestInit & { next?: { revalidate?: number } },
    retries = 2
): Promise<Response> {
    let lastError: unknown
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, {
                ...init,
                signal: AbortSignal.timeout(8000),
            })
            if (res.ok || (res.status >= 400 && res.status < 500)) return res
            lastError = new Error(`Upstream ${res.status}`)
        } catch (err) {
            lastError = err
        }
        if (attempt < retries) {
            const delay = 200 * 2 ** attempt + Math.random() * 150
            await new Promise((r) => setTimeout(r, delay))
        }
    }
    throw lastError
}

function buildUrl(
    endpoint: string,
    params?: Record<string, string | number | string[] | number[] | undefined>
) {
    const url = new URL(endpoint, BASE_URL)
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined) return
            if (Array.isArray(value)) {
                url.searchParams.set(key, value.join(","))
            } else {
                url.searchParams.set(key, String(value))
            }
        })
    }
    return url.toString()
}

export async function getPopularBooks(
    page = 1
): Promise<PaginatedResponse<Book>> {
    const url = buildUrl("/books", { sort: "popular", page })
    const res = await fetchWithRetry(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`Failed to fetch books: ${res.status}`)
    return res.json()
}

export async function searchBooks(
    filters: BookFilters = {}
): Promise<PaginatedResponse<Book>> {
    const {
        page,
        search,
        languages,
        topic,
        author_year_start,
        author_year_end,
        sort,
    } = filters
    const url = buildUrl("/books", {
        page,
        search,
        languages: languages?.length ? languages : undefined,
        topic: topic || undefined,
        author_year_start,
        author_year_end,
        sort: sort || "popular",
    })
    const res = await fetchWithRetry(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`Failed to search books: ${res.status}`)
    return res.json()
}

export async function getBookById(id: number): Promise<Book> {
    const url = buildUrl(`/books/${id}`)
    const res = await fetchWithRetry(url, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`Failed to fetch book ${id}: ${res.status}`)
    const data = await res.json()
    return data
}

export type BrowseSort = "popular" | "descending"

export async function getBooksByTopic(
    topic: string,
    page = 1,
    sort: BrowseSort = "popular"
): Promise<PaginatedResponse<Book>> {
    const url = buildUrl("/books", { topic, page, sort })
    const res = await fetchWithRetry(url, { next: { revalidate: 3600 } })
    if (!res.ok)
        throw new Error(`Failed to fetch books by topic: ${res.status}`)
    return res.json()
}

export function getCoverUrl(book: Book): string | null {
    return book.formats["image/jpeg"] || null
}

export function getReadableTextUrl(book: Book): string | null {
    const preferredFormats = [
        "text/plain; charset=utf-8",
        "text/plain; charset=us-ascii",
        "text/plain",
    ]

    for (const format of preferredFormats) {
        if (book.formats[format]) return book.formats[format]
    }

    const textFormat = Object.entries(book.formats).find(([mimeType]) =>
        mimeType.startsWith("text/plain")
    )

    return textFormat?.[1] || null
}

export function getOnlineReadUrl(book: Book): string | null {
    return (
        book.formats["text/html"] ||
        Object.entries(book.formats).find(([mimeType]) =>
            mimeType.startsWith("text/html")
        )?.[1] ||
        null
    )
}

export function getFormatLabel(mimeType: string): string {
    const labels: Record<string, string> = {
        "text/html": "Read Online",
        "text/plain; charset=utf-8": "Plain Text (UTF-8)",
        "text/plain; charset=us-ascii": "Plain Text",
        "application/epub+zip": "EPUB",
        "application/x-mobipocket-ebook": "Kindle",
        "application/octet-stream": "ZIP",
    }
    return (
        labels[mimeType] ||
        mimeType.split(";")[0].split("/")[1]?.toUpperCase() ||
        mimeType
    )
}

export function formatAuthorName(person: Person): string {
    const parts = person.name.split(",")
    if (parts.length === 2) {
        return `${parts[1].trim()} ${parts[0].trim()}`
    }
    return person.name
}

export function formatDownloadCount(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
    return count.toString()
}
