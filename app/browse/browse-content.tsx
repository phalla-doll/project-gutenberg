"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Button } from "@/components/ui/button"
import { getBooksByTopic } from "@/lib/gutendex"
import type { PaginatedResponse, Book } from "@/lib/gutendex"
import { getCached, setCache } from "@/lib/book-cache"

interface Topic {
    slug: string
    label: string
}

interface BrowseContentProps {
    topics: Topic[]
    activeTopic: string
    currentPage: number
    initialData: PaginatedResponse<Book>
    initialKey: string
}

export function BrowseContent({
    topics,
    activeTopic,
    currentPage,
    initialData,
    initialKey,
}: BrowseContentProps) {
    const router = useRouter()
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const [books, setBooks] = useState(initialData.results)
    const [nextPage, setNextPage] = useState(currentPage + 1)
    const [hasNext, setHasNext] = useState(initialData.next !== null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        setCache(initialKey, initialData)
    }, [initialData, initialKey])

    const loadMore = useCallback(async () => {
        if (loading || !hasNext) return

        setLoading(true)
        setError(null)

        try {
            const key = `${activeTopic}|${nextPage}`
            const data =
                getCached(key) ?? (await getBooksByTopic(activeTopic, nextPage))

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
    }, [activeTopic, hasNext, loading, nextPage])

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

    function handleTopicChange(topic: string) {
        router.push(`/browse?topic=${encodeURIComponent(topic)}`)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="flex flex-col gap-6">
            <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label="Filter by topic"
            >
                {topics.map(({ slug, label }) => (
                    <button
                        key={slug}
                        type="button"
                        onClick={() => handleTopicChange(slug)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            activeTopic === slug
                                ? "bg-card text-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

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
        </div>
    )
}
