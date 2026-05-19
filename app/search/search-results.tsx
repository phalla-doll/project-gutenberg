"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookGrid, BookGridSkeleton } from "@/components/book-grid"
import { searchBooks } from "@/lib/gutendex-client"
import type { PaginatedResponse, Book } from "@/lib/gutendex"
import {
    Search01Icon,
    Cancel01Icon,
    FileSearchIcon,
    SearchRemoveIcon,
} from "hugeicons-react"
import { getCached, setCache } from "@/lib/book-cache"

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
    initialData?: PaginatedResponse<Book>
    initialKey?: string
}

export function SearchResults({
    query,
    topic,
    lang,
    initialData,
    initialKey,
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

    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const [books, setBooks] = useState(initialData?.results ?? [])
    const [nextPage, setNextPage] = useState(2)
    const [hasNext, setHasNext] = useState(initialData?.next !== null)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(
        hasSearch && !initialData
    )
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (initialData && initialKey) {
            setCache(initialKey, initialData)
        }
    }, [initialData, initialKey])

    const searchKey = `${query}|${topic}|${lang}`
    const [prevSearchKey, setPrevSearchKey] = useState(searchKey)

    if (prevSearchKey !== searchKey) {
        setPrevSearchKey(searchKey)
        if (!hasSearch) {
            setBooks([])
            setHasNext(false)
            setInitialLoading(false)
            setError(null)
        } else if (!initialData || initialKey !== `${searchKey}|1`) {
            setBooks([])
            setHasNext(false)
            setInitialLoading(true)
            setError(null)
        } else {
            setBooks(initialData.results)
            setHasNext(initialData.next !== null)
            setNextPage(2)
            setInitialLoading(false)
            setError(null)
        }
    }

    useEffect(() => {
        if (!hasSearch) return

        if (books.length > 0 || initialLoading === false) return

        let cancelled = false

        async function fetchInitial() {
            setError(null)

            try {
                const key = `${query}|${topic}|${lang}|1`
                const data =
                    getCached(key) ??
                    (await searchBooks({
                        search: query || undefined,
                        topic: topic || undefined,
                        languages: lang ? [lang] : undefined,
                        page: 1,
                    }))

                if (!cancelled) {
                    setCache(key, data)
                    setBooks(data.results)
                    setHasNext(data.next !== null)
                    setNextPage(2)
                    setInitialLoading(false)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err : new Error(String(err))
                    )
                    setInitialLoading(false)
                }
            }
        }

        void fetchInitial()

        return () => {
            cancelled = true
        }
    }, [books.length, hasSearch, initialLoading, query, topic, lang])

    const loadMore = useCallback(async () => {
        if (loading || !hasNext || !hasSearch) return

        setLoading(true)
        setError(null)

        try {
            const key = `${query}|${topic}|${lang}|${nextPage}`
            const data =
                getCached(key) ??
                (await searchBooks({
                    search: query || undefined,
                    topic: topic || undefined,
                    languages: lang ? [lang] : undefined,
                    page: nextPage,
                }))

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
    }, [hasNext, loading, nextPage, query, topic, lang, hasSearch])

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasNext) return

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
    }, [hasNext, loadMore])

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
                            placeholder="Search by title or author..."
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
                                <button
                                    key={code}
                                    type="button"
                                    onClick={() =>
                                        setSelectedLang(
                                            selectedLang === code ? "" : code
                                        )
                                    }
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        selectedLang === code
                                            ? "bg-card text-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    {label}
                                </button>
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
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() =>
                                        setSelectedTopic(
                                            selectedTopic === t ? "" : t
                                        )
                                    }
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        selectedTopic === t
                                            ? "bg-card text-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </form>

            {error && !initialLoading && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <p className="text-lg text-muted-foreground">
                        Failed to load search results. Please try again.
                    </p>
                    <Button
                        onClick={() => {
                            setError(null)
                            setInitialLoading(true)
                            setBooks([])
                            setNextPage(2)
                            void (async () => {
                                try {
                                    const key = `${query}|${topic}|${lang}|1`
                                    const data =
                                        getCached(key) ??
                                        (await searchBooks({
                                            search: query || undefined,
                                            topic: topic || undefined,
                                            languages: lang
                                                ? [lang]
                                                : undefined,
                                            page: 1,
                                        }))
                                    setCache(key, data)
                                    setBooks(data.results)
                                    setHasNext(data.next !== null)
                                    setInitialLoading(false)
                                } catch (err) {
                                    setError(
                                        err instanceof Error
                                            ? err
                                            : new Error(String(err))
                                    )
                                    setInitialLoading(false)
                                }
                            })()
                        }}
                        variant="outline"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {initialLoading && <BookGridSkeleton />}

            {!error && !initialLoading && hasSearch && books.length > 0 && (
                <>
                    <BookGrid books={books} />
                    <div ref={sentinelRef} className="flex justify-center py-8">
                        {loading && (
                            <div className="w-full" aria-live="polite">
                                <BookGridSkeleton />
                            </div>
                        )}
                        {!hasNext && !loading && (
                            <p className="text-sm text-muted-foreground">
                                You have reached the end of the list.
                            </p>
                        )}
                    </div>
                </>
            )}

            {!error && !initialLoading && !hasSearch && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <FileSearchIcon className="size-12 text-muted-foreground/40" />
                    <p className="text-lg text-muted-foreground">
                        Search for books by title, author, or filter by topic
                        and language
                    </p>
                </div>
            )}

            {!error && !initialLoading && hasSearch && books.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <SearchRemoveIcon className="size-12 text-muted-foreground/40" />
                    <p className="text-lg text-muted-foreground">
                        No books found. Try adjusting your search or filters.
                    </p>
                </div>
            )}
        </div>
    )
}
