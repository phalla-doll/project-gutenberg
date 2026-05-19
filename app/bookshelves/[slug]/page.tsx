import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getBookshelves, getBooksByBookshelf } from "@/lib/gutendex-server"
import { BookshelfBookList } from "./bookshelf-book-list"
import { displayBookshelfName } from "../bookshelf-collections"
import { defaultOgImage, siteName } from "@/lib/site-metadata"
import { ArrowLeft01Icon, Bookshelf01Icon } from "hugeicons-react"
import type { BrowseSort } from "@/lib/gutendex"
import type { Metadata } from "next"

export async function generateStaticParams() {
    const shelves = await getBookshelves()
    return shelves.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const shelves = await getBookshelves()
    const shelf = shelves.find((s) => s.slug === slug)
    if (!shelf) return { title: "Reading List" }

    const displayName = displayBookshelfName(shelf.name)
    const title = `${displayName} - Reading Lists`
    const description = `Browse ${shelf.count} free ebooks in the "${displayName}" reading list`

    return {
        title: displayName,
        description,
        alternates: {
            canonical: `/bookshelves/${slug}`,
        },
        openGraph: {
            title: `${title} - ${siteName}`,
            description,
            url: `/bookshelves/${slug}`,
            siteName,
            locale: "en_US",
            type: "website",
            images: [defaultOgImage],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} - ${siteName}`,
            description,
            images: [defaultOgImage.url],
        },
    }
}

function parseSort(value: string | undefined): BrowseSort {
    return value === "descending" ? "descending" : "popular"
}

const SORT_OPTIONS: { value: BrowseSort; label: string }[] = [
    { value: "popular", label: "Popular" },
    { value: "descending", label: "Recently added" },
]

export default async function BookshelfSlugPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ sort?: string }>
}) {
    const { slug } = await params
    const sp = await searchParams

    const shelves = await getBookshelves()
    const shelf = shelves.find((s) => s.slug === slug)
    if (!shelf) notFound()

    const sort = parseSort(sp.sort)
    const initialData = await getBooksByBookshelf(shelf.name, 1, sort)

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Link href="/bookshelves">
                <Button variant="link" size="sm" className="mb-6 gap-2 px-0">
                    <ArrowLeft01Icon className="size-4" aria-hidden="true" />
                    All reading lists
                </Button>
            </Link>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <Bookshelf01Icon
                            className="size-5 text-primary"
                            aria-hidden="true"
                        />
                        <span className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                            Reading List
                        </span>
                    </div>
                    <h1 className="font-heading text-3xl tracking-tight md:text-4xl">
                        {displayBookshelfName(shelf.name)}
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        {shelf.count} book{shelf.count !== 1 ? "s" : ""}
                    </p>
                </div>

                <div
                    className="flex items-center gap-3"
                    role="group"
                    aria-label="Sort books"
                >
                    <span className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                        Sort
                    </span>
                    <div className="inline-flex items-center rounded-full border border-border/70 bg-background/60 p-0.5">
                        {SORT_OPTIONS.map(({ value, label }) => {
                            const isActive = sort === value
                            const qs = new URLSearchParams()
                            if (value !== "popular") qs.set("sort", value)
                            const href = `/bookshelves/${slug}${qs.toString() ? `?${qs}` : ""}`
                            return (
                                <Link key={value} href={href}>
                                    <button
                                        type="button"
                                        aria-pressed={isActive}
                                        className={`rounded-full px-3.5 py-1 text-sm transition-colors ${
                                            isActive
                                                ? "bg-foreground text-background"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>

            <BookshelfBookList
                shelfName={shelf.name}
                initialPage={1}
                sort={sort}
                initialData={initialData}
            />
        </div>
    )
}
