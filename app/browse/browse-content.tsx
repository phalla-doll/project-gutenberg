"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
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
    const topicRequestRef = useRef(0)
    const [books, setBooks] = useState(initialData.results)
    const [nextPage, setNextPage] = useState(currentPage + 1)
    const [hasNext, setHasNext] = useState(initialData.next !== null)
    const [loading, setLoading] = useState(false)
    const [topicLoading, setTopicLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [selectedTopic, setSelectedTopic] = useState(activeTopic)
    const [, startTransition] = useTransition()

    useEffect(() => {
        setCache(initialKey, initialData)
    }, [initialData, initialKey])

    const loadMore = useCallback(async () => {
        if (loading || topicLoading || !hasNext) return

        setLoading(true)
        setError(null)

        try {
            const key = `${selectedTopic}|${nextPage}`
            const data =
                getCached(key) ??
                (await getBooksByTopic(selectedTopic, nextPage))

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
    }, [hasNext, loading, nextPage, selectedTopic, topicLoading])

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || topicLoading || !hasNext) return

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
    }, [hasNext, loadMore, topicLoading])

    function handleTopicChange(topic: string) {
        if (topic === selectedTopic) return

        const requestId = topicRequestRef.current + 1
        topicRequestRef.current = requestId
        setSelectedTopic(topic)
        setTopicLoading(true)
        setError(null)
        startTransition(() => {
            router.push(`/browse?topic=${encodeURIComponent(topic)}`)
        })
        void loadTopic(topic, requestId)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    async function loadTopic(topic: string, requestId: number) {
        try {
            const key = `${topic}|1`
            const data = getCached(key) ?? (await getBooksByTopic(topic, 1))

            if (topicRequestRef.current !== requestId) return

            setCache(key, data)
            setBooks(data.results)
            setNextPage(2)
            setHasNext(data.next !== null)
        } catch (err) {
            if (topicRequestRef.current !== requestId) return

            setError(err instanceof Error ? err : new Error(String(err)))
        } finally {
            if (topicRequestRef.current === requestId) {
                setTopicLoading(false)
            }
        }
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
                        aria-pressed={selectedTopic === slug}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            selectedTopic === slug
                                ? "bg-card text-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {topicLoading ? (
                <div aria-live="polite">
                    <BookGridSkeleton />
                </div>
            ) : (
                <BookGrid books={books} />
            )}
            <div ref={sentinelRef} className="flex justify-center py-8">
                {!topicLoading && loading && (
                    <div className="w-full" aria-live="polite">
                        <BookGridSkeleton />
                    </div>
                )}
                {!topicLoading && error && (
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
                {!topicLoading && !hasNext && !loading && !error && (
                    <p className="text-sm text-muted-foreground">
                        You have reached the end of the list.
                    </p>
                )}
            </div>
        </div>
    )
}
