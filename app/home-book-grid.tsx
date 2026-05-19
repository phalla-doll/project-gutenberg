"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Button } from "@/components/ui/button"
import type { Book, PaginatedResponse } from "@/lib/gutendex"
import { getPopularBooks } from "@/lib/gutendex-client"
import { getCached, setCache } from "@/lib/book-cache"

interface HomeBookGridProps {
    initialData: PaginatedResponse<Book>
    currentPage: number
}

export function HomeBookGrid({ initialData, currentPage }: HomeBookGridProps) {
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const [books, setBooks] = useState(initialData.results)
    const [nextPage, setNextPage] = useState(currentPage + 1)
    const [hasNext, setHasNext] = useState(initialData.next !== null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        setCache(`page:${currentPage}`, initialData)
    }, [currentPage, initialData])

    const loadMore = useCallback(async () => {
        if (loading || !hasNext) return

        setLoading(true)
        setError(null)

        try {
            const key = `page:${nextPage}`
            const data = getCached(key) ?? (await getPopularBooks(nextPage))

            setCache(key, data)
            setBooks((currentBooks) => {
                const bookIds = new Set(currentBooks.map((book) => book.id))
                const newBooks = data.results.filter(
                    (book) => !bookIds.has(book.id)
                )

                return [...currentBooks, ...newBooks]
            })
            setHasNext(data.next !== null)
            setNextPage((page) => page + 1)
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)))
        } finally {
            setLoading(false)
        }
    }, [hasNext, loading, nextPage])

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasNext) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    void loadMore()
                }
            },
            { rootMargin: "480px 0px" }
        )

        observer.observe(sentinel)

        return () => observer.disconnect()
    }, [hasNext, loadMore])

    return (
        <>
            <BookGrid books={books} />
            <div ref={sentinelRef} className="flex justify-center py-8">
                {loading && (
                    <div className="w-full" aria-live="polite">
                        <BookGridSkeleton />
                    </div>
                )}
                {error && (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Failed to load more books. Please try again.
                        </p>
                        <Button
                            onClick={() => void loadMore()}
                            variant="outline"
                        >
                            Retry
                        </Button>
                    </div>
                )}
                {!hasNext && !loading && !error && (
                    <p className="text-sm text-muted-foreground">
                        You have reached the end of the list.
                    </p>
                )}
            </div>
        </>
    )
}
