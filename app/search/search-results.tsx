"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Pagination } from "@/components/pagination"
import { searchBooks } from "@/lib/gutendex"
import type { PaginatedResponse, Book } from "@/lib/gutendex"
import { Search01Icon, Cancel01Icon } from "hugeicons-react"

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
]

const TOPICS = [
  "Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "History",
  "Philosophy",
  "Science",
  "Poetry",
  "Children",
  "Adventure",
  "Horror",
]

interface FetchKey {
  query: string
  topic: string
  lang: string
  page: number
}

interface SearchResultsProps {
  query: string
  topic: string
  lang: string
  currentPage: number
}

export function SearchResults({ query, topic, lang, currentPage }: SearchResultsProps) {
  const router = useRouter()
  const [inputQuery, setInputQuery] = useState(query)
  const [selectedLang, setSelectedLang] = useState(lang)
  const [selectedTopic, setSelectedTopic] = useState(topic)
  const [data, setData] = useState<{ key: FetchKey; result: PaginatedResponse<Book> } | null>(null)

  const hasSearch = query || topic
  const currentKey: FetchKey = { query, topic, lang, page: currentPage }
  const loading = hasSearch && (!data || JSON.stringify(data.key) !== JSON.stringify(currentKey))

  useEffect(() => {
    if (!query && !topic) return
    searchBooks({
      search: query || undefined,
      topic: topic || undefined,
      languages: lang ? [lang] : undefined,
      page: currentPage,
    }).then((result) => {
      setData({ key: { query, topic, lang, page: currentPage }, result })
    })
  }, [query, topic, lang, currentPage])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (inputQuery) params.set("q", inputQuery)
    if (selectedTopic) params.set("topic", selectedTopic)
    if (selectedLang) params.set("lang", selectedLang)
    router.push(`/search?${params.toString()}`)
  }

  function clearFilters() {
    setInputQuery("")
    setSelectedLang("")
    setSelectedTopic("")
    router.push("/search")
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (topic) params.set("topic", topic)
    if (lang) params.set("lang", lang)
    params.set("page", page.toString())
    router.push(`/search?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const hasActiveFilters = query || topic || lang

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search01Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title or author..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" onClick={clearFilters}>
              <Cancel01Icon className="size-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Language</p>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map(({ code, label }) => (
                <Badge
                  key={code}
                  variant={selectedLang === code ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedLang(selectedLang === code ? "" : code)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Topic</p>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map((t) => (
                <Badge
                  key={t}
                  variant={selectedTopic === t ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTopic(selectedTopic === t ? "" : t)}
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </form>

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

      {!loading && !hasSearch && (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            Search for books by title, author, or filter by topic and language
          </p>
        </div>
      )}

      {!loading && data && data.result.results.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No books found. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  )
}
