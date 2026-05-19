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

export type BrowseSort = "popular" | "descending"

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
