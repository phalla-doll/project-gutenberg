import type { PaginatedResponse, Book } from "@/lib/gutendex"

const cache = new Map<string, PaginatedResponse<Book>>()

export function getCached(key: string): PaginatedResponse<Book> | undefined {
    return cache.get(key)
}

export function setCache(key: string, data: PaginatedResponse<Book>): void {
    cache.set(key, data)
}

export function hasCached(key: string): boolean {
    return cache.has(key)
}
