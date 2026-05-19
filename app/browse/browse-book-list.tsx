"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Button } from "@/components/ui/button"
import { getBooksByTopic } from "@/lib/gutendex-client"
import {
    type Book,
    type BrowseSort,
    type PaginatedResponse,
} from "@/lib/gutendex"
import { getCached, setCache } from "@/lib/book-cache"
import { SearchRemoveIcon } from "hugeicons-react"

interface BrowseBookListProps {
    topicSlug: string
    topicQuery: string
    initialPage: number
    sort: BrowseSort
    initialData: PaginatedResponse<Book>
}

export function BrowseBookList({
    topicSlug,
    topicQuery,
    initialPage,
    sort,
    initialData,
}: BrowseBookListProps) {
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const [books, setBooks] = useState(initialData.results)
    const [nextPage, setNextPage] = useState(initialPage + 1)
    const [hasNext, setHasNext] = useState(initialData.next !== null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const loadMore = useCallback(async () => {
        if (loading || !hasNext) return

        setLoading(true)
        setError(null)

        try {
            const key = `${topicSlug}|${nextPage}|${sort}`
            const data =
                getCached(key) ??
                (await getBooksByTopic(topicQuery, nextPage, sort))

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
    }, [hasNext, loading, nextPage, sort, topicQuery, topicSlug])

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
            {books.length > 0 ? (
                <>
                    <BookGrid books={books} />
                    <div
                        ref={sentinelRef}
                        className="flex justify-center py-8"
                    >
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
            ) : (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <SearchRemoveIcon className="size-12 text-muted-foreground/40" />
                    <p className="text-lg text-muted-foreground">
                        No books found for this topic.
                    </p>
                </div>
            )}
        </>
    )
}
