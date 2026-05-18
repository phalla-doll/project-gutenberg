"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Button } from "@/components/ui/button"
import { getPopularBooks } from "@/lib/gutendex"
import type { Book } from "@/lib/gutendex"
import { getCached, setCache } from "@/lib/book-cache"

interface HomeBookGridProps {
    currentPage: number
}

export function HomeBookGrid({ currentPage }: HomeBookGridProps) {
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const [state, setState] = useState<{
        books: Book[]
        hasNext: boolean
        initialLoading: boolean
        error: Error | null
    }>(() => {
        const key = `page:${currentPage}`
        const cached = getCached(key)
        if (cached) {
            return {
                books: cached.results,
                hasNext: cached.next !== null,
                initialLoading: false,
                error: null,
            }
        }
        return { books: [], hasNext: false, initialLoading: true, error: null }
    })
    const [nextPage, setNextPage] = useState(currentPage + 1)
    const [loading, setLoading] = useState(false)
    const fetchedRef = useRef(false)

    const { books, hasNext, initialLoading, error } = state

    useEffect(() => {
        if (!initialLoading || fetchedRef.current) return
        fetchedRef.current = true

        let cancelled = false
        const key = `page:${currentPage}`

        getPopularBooks(currentPage)
            .then((data) => {
                if (cancelled) return
                setCache(key, data)
                setState({
                    books: data.results,
                    hasNext: data.next !== null,
                    initialLoading: false,
                    error: null,
                })
            })
            .catch((err) => {
                if (cancelled) return
                setState((prev) => ({
                    ...prev,
                    initialLoading: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                }))
            })

        return () => {
            cancelled = true
        }
    }, [currentPage, initialLoading])

    const loadMore = useCallback(async () => {
        if (loading || !hasNext) return

        setLoading(true)
        setState((prev) => ({ ...prev, error: null }))

        try {
            const key = `page:${nextPage}`
            const data = getCached(key) ?? (await getPopularBooks(nextPage))

            setCache(key, data)
            setState((prev) => {
                const bookIds = new Set(prev.books.map((book) => book.id))
                const newBooks = data.results.filter(
                    (book) => !bookIds.has(book.id)
                )

                return {
                    ...prev,
                    books: [...prev.books, ...newBooks],
                    hasNext: data.next !== null,
                }
            })
            setNextPage((page) => page + 1)
        } catch (err) {
            setState((prev) => ({
                ...prev,
                error: err instanceof Error ? err : new Error(String(err)),
            }))
        } finally {
            setLoading(false)
        }
    }, [hasNext, loading, nextPage])

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasNext || initialLoading) return

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
    }, [hasNext, loadMore, initialLoading])

    if (initialLoading) {
        return <BookGridSkeleton />
    }

    if (error && books.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                    Failed to load books. Please try again.
                </p>
                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                >
                    Retry
                </Button>
            </div>
        )
    }

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
