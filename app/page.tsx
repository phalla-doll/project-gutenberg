import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight01Icon } from "hugeicons-react"
import { type Book, formatAuthorName, getCoverUrl } from "@/lib/gutendex"
import { getPopularBooks } from "@/lib/gutendex-server"
import { BookGridSkeleton } from "@/components/book-grid"
import { BookJacket } from "@/components/book-jacket"
import { Skeleton } from "@/components/ui/skeleton"
import { HomeBookGrid } from "./home-book-grid"

const discoveryTopics = [
    { slug: "classics", label: "Classics" },
    { slug: "crime-mystery", label: "Mystery" },
    { slug: "sci-fi-fantasy", label: "Sci-fi & fantasy" },
    { slug: "romance", label: "Romance" },
    { slug: "philosophy", label: "Philosophy" },
    { slug: "poetry", label: "Poetry" },
]

function DiscoveryOpening({
    books = [],
    loading = false,
}: {
    books?: Book[]
    loading?: boolean
}) {
    return (
        <section
            className="discovery-opening"
            aria-labelledby="discovery-title"
        >
            <div className="discovery-invitation">
                <h1 id="discovery-title">
                    Open a book.
                    <em>Go somewhere new.</em>
                </h1>
                <p>
                    Discover free classics, follow a little curiosity, and make
                    room for your next great read.
                </p>
                <Link href="/browse" className="feature-action">
                    Find your next read
                    <ArrowRight01Icon className="size-4" aria-hidden="true" />
                </Link>
            </div>
            <div
                className="discovery-display"
                aria-label="Popular books to explore"
            >
                {books.slice(0, 3).map((book) => (
                    <Link
                        key={book.id}
                        href={`/book/${book.id}`}
                        className="display-book"
                        aria-label={`Open ${book.title} by ${book.authors[0] ? formatAuthorName(book.authors[0]) : "Unknown Author"}`}
                        title={book.title}
                    >
                        <BookJacket book={book} priority />
                        <span className="display-caption">{book.title}</span>
                    </Link>
                ))}
                {loading &&
                    Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="display-book"
                            aria-hidden="true"
                        >
                            <Skeleton className="aspect-[2/3] w-full rounded-md" />
                        </div>
                    ))}
                {!loading && books.length === 0 && (
                    <p className="discovery-empty">
                        No books on this page. Browse topics to keep exploring.
                    </p>
                )}
            </div>
        </section>
    )
}

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Suspense
                key={page}
                fallback={
                    <>
                        <DiscoveryOpening loading />
                        <BookGridSkeleton />
                    </>
                }
            >
                <HomeBooks page={page} />
            </Suspense>
        </div>
    )
}

async function HomeBooks({ page }: { page: number }) {
    const data = await getPopularBooks(page)
    const lcpImage = data.results[0] ? getCoverUrl(data.results[0]) : null

    return (
        <>
            {lcpImage && (
                <link
                    rel="preload"
                    as="image"
                    href={lcpImage}
                    fetchPriority="high"
                />
            )}
            <DiscoveryOpening books={data.results} />
            <div className="catalog-heading">
                <div>
                    <h2 className="font-heading text-3xl font-medium sm:text-4xl">
                        Popular Books
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Discover the most downloaded picks from 75,000+ free
                        books
                    </p>
                </div>
                <Link href="/bookshelves" className="discovery-link shrink-0">
                    Explore reading lists
                    <ArrowRight01Icon className="size-4" aria-hidden="true" />
                </Link>
            </div>
            <nav className="discovery-topics" aria-label="Explore book topics">
                <div className="flex flex-wrap gap-2">
                    {discoveryTopics.map(({ slug, label }) => (
                        <Link
                            key={slug}
                            href={`/browse?topic=${slug}`}
                            className="topic-link"
                        >
                            {label}
                        </Link>
                    ))}
                    <Link href="/browse" className="topic-link topic-link-all">
                        All topics
                        <ArrowRight01Icon
                            className="size-3.5"
                            aria-hidden="true"
                        />
                    </Link>
                </div>
            </nav>
            <HomeBookGrid key={page} initialData={data} currentPage={page} />
        </>
    )
}
