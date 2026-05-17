"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Pagination } from "@/components/pagination"
import { Badge } from "@/components/ui/badge"
import { getBooksByTopic } from "@/lib/gutendex"
import type { PaginatedResponse, Book } from "@/lib/gutendex"

interface Topic {
  slug: string
  label: string
}

interface BrowseContentProps {
  topics: Topic[]
  activeTopic: string
  currentPage: number
}

export function BrowseContent({ topics, activeTopic, currentPage }: BrowseContentProps) {
  const router = useRouter()
  const [data, setData] = useState<{
    topic: string
    page: number
    result: PaginatedResponse<Book>
  } | null>(null)

  const loading = !data || data.topic !== activeTopic || data.page !== currentPage

  useEffect(() => {
    getBooksByTopic(activeTopic, currentPage).then((result) => {
      setData({ topic: activeTopic, page: currentPage, result })
    })
  }, [activeTopic, currentPage])

  function handleTopicChange(topic: string) {
    router.push(`/browse?topic=${encodeURIComponent(topic)}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handlePageChange(page: number) {
    router.push(`/browse?topic=${encodeURIComponent(activeTopic)}&page=${page}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-1.5">
        {topics.map(({ slug, label }) => (
          <Badge
            key={slug}
            variant={activeTopic === slug ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleTopicChange(slug)}
          >
            {label}
          </Badge>
        ))}
      </div>

      {loading && <BookGridSkeleton />}

      {!loading && data && (
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
      )}
    </div>
  )
}
