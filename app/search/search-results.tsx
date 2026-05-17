"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { Pagination } from "@/components/pagination"
import { searchBooks } from "@/lib/gutendex"
import { Search01Icon, Cancel01Icon } from "hugeicons-react"
import { usePaginatedBooks } from "@/hooks/use-paginated-books"

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

interface SearchResultsProps {
    query: string
    topic: string
    lang: string
    currentPage: number
}

export function SearchResults({
    query,
    topic,
    lang,
    currentPage,
}: SearchResultsProps) {
    const router = useRouter()
    const [inputQuery, setInputQuery] = useState(query)
    const [selectedLang, setSelectedLang] = useState(lang)
    const [selectedTopic, setSelectedTopic] = useState(topic)

    const [prevQuery, setPrevQuery] = useState(query)
    if (prevQuery !== query) {
        setPrevQuery(query)
        setInputQuery(query)
    }

    const [prevLang, setPrevLang] = useState(lang)
    if (prevLang !== lang) {
        setPrevLang(lang)
        setSelectedLang(lang)
    }

    const [prevTopic, setPrevTopic] = useState(topic)
    if (prevTopic !== topic) {
        setPrevTopic(topic)
        setSelectedTopic(topic)
    }

    const hasSearch = !!(query || topic)
    const key = `${query}|${topic}|${lang}|${currentPage}`

    const fetchFn = useCallback(
        () =>
            searchBooks({
                search: query || undefined,
                topic: topic || undefined,
                languages: lang ? [lang] : undefined,
                page: currentPage,
            }),
        [query, topic, lang, currentPage]
    )

    const { data, loading, error, retry } = usePaginatedBooks(fetchFn, key, {
        enabled: hasSearch,
    })

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
            <form
                onSubmit={handleSearch}
                className="flex flex-col gap-4"
                role="search"
            >
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search01Icon
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <Input
                            type="search"
                            name="q"
                            placeholder="Search by title or author\u2026"
                            value={inputQuery}
                            onChange={(e) => setInputQuery(e.target.value)}
                            className="pl-9"
                            aria-label="Search by title or author"
                            autoComplete="off"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                    {hasActiveFilters ? (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={clearFilters}
                            aria-label="Clear all filters"
                        >
                            <Cancel01Icon
                                className="size-4"
                                aria-hidden="true"
                            />
                        </Button>
                    ) : null}
                </div>

                <div className="flex flex-col gap-3">
                    <div role="group" aria-labelledby="language-label">
                        <p
                            id="language-label"
                            className="mb-2 text-xs font-medium text-muted-foreground"
                        >
                            Language
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {LANGUAGES.map(({ code, label }) => (
                                <Badge
                                    key={code}
                                    asChild
                                    variant={
                                        selectedLang === code
                                            ? "default"
                                            : "outline"
                                    }
                                    className="cursor-pointer"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedLang(
                                                selectedLang === code
                                                    ? ""
                                                    : code
                                            )
                                        }
                                    >
                                        {label}
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div role="group" aria-labelledby="topic-label">
                        <p
                            id="topic-label"
                            className="mb-2 text-xs font-medium text-muted-foreground"
                        >
                            Topic
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {TOPICS.map((t) => (
                                <Badge
                                    key={t}
                                    asChild
                                    variant={
                                        selectedTopic === t
                                            ? "default"
                                            : "outline"
                                    }
                                    className="cursor-pointer"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedTopic(
                                                selectedTopic === t ? "" : t
                                            )
                                        }
                                    >
                                        {t}
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </form>

            {error && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <p className="text-lg text-muted-foreground">
                        Failed to load search results. Please try again.
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

            {!error && !loading && !hasSearch && (
                <div className="py-16 text-center">
                    <p className="text-lg text-muted-foreground">
                        Search for books by title, author, or filter by topic
                        and language
                    </p>
                </div>
            )}

            {!error && !loading && data && data.results.length === 0 && (
                <div className="py-16 text-center">
                    <p className="text-lg text-muted-foreground">
                        No books found. Try adjusting your search or filters.
                    </p>
                </div>
            )}
        </div>
    )
}
