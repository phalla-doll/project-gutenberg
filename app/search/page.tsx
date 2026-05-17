import { Suspense } from "react"
import { SearchResults } from "./search-results"
import { BookGridSkeleton } from "@/components/book-grid"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search - Project Gutenberg",
  description: "Search through thousands of free ebooks from Project Gutenberg",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; topic?: string; lang?: string; page?: string }>
}) {
  const params = await searchParams
  const query = params.q || ""
  const topic = params.topic || ""
  const lang = params.lang || ""
  const page = Number(params.page) || 1

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Search Books
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find your next great read from over 70,000 free ebooks
        </p>
      </div>
      <Suspense fallback={<BookGridSkeleton />}>
        <SearchResults
          query={query}
          topic={topic}
          lang={lang}
          currentPage={page}
        />
      </Suspense>
    </div>
  )
}
