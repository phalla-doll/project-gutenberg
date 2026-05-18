"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Button } from "@/components/ui/button"
import { getBooksByTopic } from "@/lib/gutendex"
import type { Book } from "@/lib/gutendex"
import { getCached, setCache } from "@/lib/book-cache"

interface Topic {
    slug: string
    label: string
}

interface BrowseContentProps {
    topics: Topic[]
    activeTopic: string
    currentPage: number
}

export function BrowseContent({
    topics,
    activeTopic,
    currentPage,
}: BrowseContentProps) {
    const router = useRouter()
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const topicRequestRef = useRef(0)
    const [state, setState] = useState<{
        books: Book[]
        hasNext: boolean
        initialLoading: boolean
        error: Error | null
    }>(() => {
        const key = `${activeTopic}|${currentPage}`
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
    const [topicLoading, setTopicLoading] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState(activeTopic)
    const [, startTransition] = useTransition()
    const fetchedRef = useRef(false)

    const { books, hasNext, initialLoading, error } = state

    useEffect(() => {
        if (!initialLoading || fetchedRef.current) return
        fetchedRef.current = true

        let cancelled = false
        const key = `${activeTopic}|${currentPage}`

        getBooksByTopic(activeTopic, currentPage)
            .then((data) => {
                if (cancelled) return
                setCache(key, data)
                setState({
                    books: data.results,
                    hasNext: data.next !== null,
                    initialLoading: false,
                    error: null,
                })
                setNextPage(currentPage + 1)
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
    }, [activeTopic, currentPage, initialLoading])

    const loadMore = useCallback(async () => {
        if (loading || topicLoading || !hasNext) return

        setLoading(true)
        setState((prev) => ({ ...prev, error: null }))

        try {
            const key = `${selectedTopic}|${nextPage}`
            const data =
                getCached(key) ??
                (await getBooksByTopic(selectedTopic, nextPage))

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
    }, [hasNext, loading, nextPage, selectedTopic, topicLoading])

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || topicLoading || !hasNext || initialLoading) return

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
    }, [hasNext, loadMore, topicLoading, initialLoading])

    function handleTopicChange(topic: string) {
        if (topic === selectedTopic) return

        const requestId = topicRequestRef.current + 1
        topicRequestRef.current = requestId
        setSelectedTopic(topic)
        setTopicLoading(true)
        setState((prev) => ({ ...prev, error: null }))
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
            setState({
                books: data.results,
                hasNext: data.next !== null,
                initialLoading: false,
                error: null,
            })
            setNextPage(2)
        } catch (err) {
            if (topicRequestRef.current !== requestId) return

            setState((prev) => ({
                ...prev,
                error: err instanceof Error ? err : new Error(String(err)),
            }))
        } finally {
            if (topicRequestRef.current === requestId) {
                setTopicLoading(false)
            }
        }
    }

    const isLoading = initialLoading || topicLoading

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

            {isLoading ? (
                <div aria-live="polite">
                    <BookGridSkeleton />
                </div>
            ) : (
                <BookGrid books={books} />
            )}
            <div ref={sentinelRef} className="flex justify-center py-8">
                {!isLoading && loading && (
                    <div className="w-full" aria-live="polite">
                        <BookGridSkeleton />
                    </div>
                )}
                {!isLoading && error && (
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
                {!isLoading && !hasNext && !loading && !error && (
                    <p className="text-sm text-muted-foreground">
                        You have reached the end of the list.
                    </p>
                )}
            </div>
        </div>
    )
}
