"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Pagination } from "@/components/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBooksByTopic } from "@/lib/gutendex"
import { usePaginatedBooks } from "@/hooks/use-paginated-books"

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

    const key = `${activeTopic}|${currentPage}`

    const fetchFn = useCallback(
        () => getBooksByTopic(activeTopic, currentPage),
        [activeTopic, currentPage]
    )

    const { data, loading, error, retry } = usePaginatedBooks(fetchFn, key)

    function handleTopicChange(topic: string) {
        router.push(`/browse?topic=${encodeURIComponent(topic)}`)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    function handlePageChange(page: number) {
        router.push(
            `/browse?topic=${encodeURIComponent(activeTopic)}&page=${page}`
        )
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
                    <Badge
                        key={slug}
                        asChild
                        variant={activeTopic === slug ? "default" : "outline"}
                        className="cursor-pointer"
                    >
                        <button
                            type="button"
                            onClick={() => handleTopicChange(slug)}
                        >
                            {label}
                        </button>
                    </Badge>
                ))}
            </div>

            {error && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <p className="text-lg text-muted-foreground">
                        Failed to load books. Please try again.
                    </p>
                    <Button onClick={retry} variant="outline">
                        Retry
                    </Button>
                </div>
            )}

            {!error && loading && <BookGridSkeleton />}

            {!error && !loading && data && (
                <>
                    <BookGrid books={data.results} />
                    <Pagination
                        currentPage={currentPage}
                        hasNext={data.next !== null}
                        hasPrev={data.previous !== null}
                        onPageChange={handlePageChange}
                        totalResults={data.count}
                    />
                </>
            )}
        </div>
    )
}
