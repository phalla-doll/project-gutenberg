"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { getPopularBooks } from "@/lib/gutendex"
import { usePaginatedBooks } from "@/hooks/use-paginated-books"

interface HomeBookGridProps {
    initialData: import("@/lib/gutendex").PaginatedResponse<
        import("@/lib/gutendex").Book
    >
    currentPage: number
}

export function HomeBookGrid({ initialData, currentPage }: HomeBookGridProps) {
    const router = useRouter()

    const fetchFn = useCallback(
        () => getPopularBooks(currentPage),
        [currentPage]
    )

    const { data, loading, error, retry } = usePaginatedBooks(
        fetchFn,
        `page:${currentPage}`,
        {
            initialData,
            initialKey: "page:1",
        }
    )

    function handlePageChange(page: number) {
        router.push(`/?page=${page}`)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
                <p className="text-lg text-muted-foreground">
                    Failed to load books. Please try again.
                </p>
                <Button onClick={retry} variant="outline">
                    Retry
                </Button>
            </div>
        )
    }

    if (loading) {
        return <BookGridSkeleton />
    }

    if (!data) return null

    return (
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
    )
}
