"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Pagination } from "@/components/pagination"
import type { PaginatedResponse, Book } from "@/lib/gutendex"
import { getPopularBooks } from "@/lib/gutendex"

interface HomeBookGridProps {
    initialData: PaginatedResponse<Book>
    currentPage: number
}

export function HomeBookGrid({ initialData, currentPage }: HomeBookGridProps) {
    const router = useRouter()
    const [data, setData] = useState<{
        page: number
        result: PaginatedResponse<Book>
    }>({
        page: 1,
        result: initialData,
    })

    const loading = data.page !== currentPage

    useEffect(() => {
        getPopularBooks(currentPage).then((result) => {
            setData({ page: currentPage, result })
        })
    }, [currentPage])

    function handlePageChange(page: number) {
        router.push(`/?page=${page}`)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    if (loading) {
        return <BookGridSkeleton />
    }

    return (
        <>
            <BookGrid books={data.result.results} />
            <Pagination
                currentPage={currentPage}
                hasNext={data.result.next !== null}
                hasPrev={data.result.previous !== null}
                onPageChange={handlePageChange}
                totalResults={data.result.count}
            />
        </>
    )
}
