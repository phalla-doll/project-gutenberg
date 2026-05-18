"use client"

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react"
import { useRouter } from "next/navigation"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Button } from "@/components/ui/button"
import { getBooksByTopic, type BrowseSort } from "@/lib/gutendex"
import type { PaginatedResponse, Book } from "@/lib/gutendex"
import { getCached, setCache } from "@/lib/book-cache"
import type { BrowseTopicGroup } from "./page"

interface BrowseContentProps {
    topicGroups: BrowseTopicGroup[]
    activeTopicSlug: string
    currentPage: number
    initialSort: BrowseSort
    initialData: PaginatedResponse<Book>
    initialKey: string
}

const SORT_OPTIONS: { value: BrowseSort; label: string }[] = [
    { value: "popular", label: "Popular" },
    { value: "descending", label: "Recently added" },
]

export function BrowseContent({
    topicGroups,
    activeTopicSlug,
    currentPage,
    initialSort,
    initialData,
    initialKey,
}: BrowseContentProps) {
    const router = useRouter()
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const reloadRequestRef = useRef(0)
    const [books, setBooks] = useState(initialData.results)
    const [nextPage, setNextPage] = useState(currentPage + 1)
    const [hasNext, setHasNext] = useState(initialData.next !== null)
    const [loading, setLoading] = useState(false)
    const [reloading, setReloading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [selectedSlug, setSelectedSlug] = useState(activeTopicSlug)
    const [sort, setSort] = useState<BrowseSort>(initialSort)
    const [, startTransition] = useTransition()

    const topicBySlug = useMemo(
        () =>
            new Map(
                topicGroups.flatMap((g) => g.topics.map((t) => [t.slug, t]))
            ),
        [topicGroups]
    )

    const groupOfActive =
        topicGroups.find((g) =>
            g.topics.some((t) => t.slug === selectedSlug)
        ) ?? topicGroups[0]
    const [activeGroupHeading, setActiveGroupHeading] = useState(
        groupOfActive.heading
    )
    const activeGroup =
        topicGroups.find((g) => g.heading === activeGroupHeading) ??
        topicGroups[0]

    useEffect(() => {
        setCache(initialKey, initialData)
    }, [initialData, initialKey])

    const loadMore = useCallback(async () => {
        if (loading || reloading || !hasNext) return

        const topic = topicBySlug.get(selectedSlug)
        if (!topic) return

        setLoading(true)
        setError(null)

        try {
            const key = `${selectedSlug}|${nextPage}|${sort}`
            const data =
                getCached(key) ??
                (await getBooksByTopic(topic.query, nextPage, sort))

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
    }, [hasNext, loading, nextPage, selectedSlug, sort, reloading, topicBySlug])

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || reloading || !hasNext) return

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
    }, [hasNext, loadMore, reloading])

    function pushUrl(slug: string, nextSort: BrowseSort) {
        const params = new URLSearchParams()
        params.set("topic", slug)
        if (nextSort !== "popular") params.set("sort", nextSort)
        router.push(`/browse?${params.toString()}`)
    }

    async function reload(slug: string, nextSort: BrowseSort) {
        const topic = topicBySlug.get(slug)
        if (!topic) return

        const requestId = reloadRequestRef.current + 1
        reloadRequestRef.current = requestId
        setReloading(true)
        setError(null)

        try {
            const key = `${slug}|1|${nextSort}`
            const data =
                getCached(key) ?? (await getBooksByTopic(topic.query, 1, nextSort))

            if (reloadRequestRef.current !== requestId) return

            setCache(key, data)
            setBooks(data.results)
            setNextPage(2)
            setHasNext(data.next !== null)
        } catch (err) {
            if (reloadRequestRef.current !== requestId) return
            setError(err instanceof Error ? err : new Error(String(err)))
        } finally {
            if (reloadRequestRef.current === requestId) {
                setReloading(false)
            }
        }
    }

    function handleTopicChange(slug: string) {
        if (slug === selectedSlug) return
        setSelectedSlug(slug)
        startTransition(() => pushUrl(slug, sort))
        void reload(slug, sort)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    function handleSortChange(nextSort: BrowseSort) {
        if (nextSort === sort) return
        setSort(nextSort)
        startTransition(() => pushUrl(selectedSlug, nextSort))
        void reload(selectedSlug, nextSort)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="flex flex-col gap-8">
            <section
                aria-label="Browse filters"
                className="rounded-2xl border border-border/70 bg-card/40"
            >
                <div
                    role="tablist"
                    aria-label="Category group"
                    className="flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2 sm:px-4"
                >
                    {topicGroups.map((group) => {
                        const isActive = group.heading === activeGroup.heading
                        const containsSelected = group.topics.some(
                            (t) => t.slug === selectedSlug
                        )
                        return (
                            <button
                                key={group.heading}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() =>
                                    setActiveGroupHeading(group.heading)
                                }
                                className={`relative shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 font-heading text-sm tracking-wide transition-colors ${
                                    isActive
                                        ? "bg-background text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {group.heading}
                                {!isActive && containsSelected && (
                                    <span
                                        aria-hidden
                                        className="ml-1.5 inline-block size-1.5 rounded-full bg-foreground/70 align-middle"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
                <div
                    className="flex flex-wrap gap-1.5 px-5 py-5 sm:px-6"
                    role="group"
                    aria-label={`Filter by ${activeGroup.heading}`}
                >
                    {activeGroup.topics.map(({ slug, label }) => {
                        const isActive = selectedSlug === slug
                        return (
                            <button
                                key={slug}
                                type="button"
                                onClick={() => handleTopicChange(slug)}
                                aria-pressed={isActive}
                                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                                    isActive
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border/70 bg-background/60 text-foreground/80 hover:border-foreground/40 hover:text-foreground"
                                }`}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            </section>

            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {activeGroup.heading}
                    </span>
                    <p className="font-heading text-2xl text-foreground">
                        {topicBySlug.get(selectedSlug)?.label}
                    </p>
                </div>
                <div
                    className="flex items-center gap-3"
                    role="group"
                    aria-label="Sort books"
                >
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Sort
                    </span>
                    <div className="inline-flex items-center rounded-full border border-border/70 bg-background/60 p-0.5">
                        {SORT_OPTIONS.map(({ value, label }) => {
                            const isActive = sort === value
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleSortChange(value)}
                                    aria-pressed={isActive}
                                    className={`rounded-full px-3.5 py-1 text-sm transition-colors ${
                                        isActive
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {reloading ? (
                <div aria-live="polite">
                    <BookGridSkeleton />
                </div>
            ) : (
                <BookGrid books={books} />
            )}
            <div ref={sentinelRef} className="flex justify-center py-8">
                {!reloading && loading && (
                    <div className="w-full" aria-live="polite">
                        <BookGridSkeleton />
                    </div>
                )}
                {!reloading && error && (
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
                {!reloading && !hasNext && !loading && !error && (
                    <p className="text-sm text-muted-foreground">
                        You have reached the end of the list.
                    </p>
                )}
            </div>
        </div>
    )
}
