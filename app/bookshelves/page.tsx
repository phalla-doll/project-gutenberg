import Link from "next/link"
import { getBookshelves } from "@/lib/gutendex-server"
import { classifyBookshelf } from "./bookshelf-collections"
import { defaultOgImage, siteName } from "@/lib/site-metadata"
import { ArrowRight01Icon } from "hugeicons-react"
import type { Metadata } from "next"

function slugify(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
}

export const metadata: Metadata = {
    title: "Reading Lists",
    description:
        "Explore hand-curated reading lists of free ebooks, organized by topic and genre",
    alternates: {
        canonical: "/bookshelves",
    },
    openGraph: {
        title: `Reading Lists - ${siteName}`,
        description:
            "Explore hand-curated reading lists of free ebooks, organized by topic and genre",
        url: "/bookshelves",
        siteName,
        locale: "en_US",
        type: "website",
        images: [defaultOgImage],
    },
    twitter: {
        card: "summary_large_image",
        title: `Reading Lists - ${siteName}`,
        description:
            "Explore hand-curated reading lists of free ebooks, organized by topic and genre",
        images: [defaultOgImage.url],
    },
}

export default async function BookshelvesPage() {
    const allShelves = await getBookshelves()

    const grouped = new Map<string, typeof allShelves>()
    const groupOrder: string[] = []

    for (const shelf of allShelves) {
        const { heading } = classifyBookshelf(shelf.name)
        if (!grouped.has(heading)) {
            grouped.set(heading, [])
            groupOrder.push(heading)
        }
        grouped.get(heading)!.push(shelf)
    }

    const totalBooks = allShelves.reduce((sum, s) => sum + s.count, 0)

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10">
                <h1 className="font-heading text-4xl tracking-tight text-balance md:text-5xl">
                    Reading Lists
                </h1>
                <p className="mt-3 text-lg text-muted-foreground">
                    <span className="tabular-nums">{allShelves.length}</span>{" "}
                    collections ·{" "}
                    <span className="tabular-nums">
                        {totalBooks.toLocaleString()}
                    </span>{" "}
                    books · hand-picked by Project Gutenberg volunteers
                </p>
            </div>

            <nav
                aria-label="Jump to section"
                className="scrollbar-none -mx-4 mb-10 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)]"
            >
                <div className="inline-flex items-center rounded-full border border-border/70 bg-background/60 p-0.5">
                    {groupOrder.map((heading) => (
                        <a
                            key={heading}
                            href={`#${slugify(heading)}`}
                            className="rounded-full px-3.5 py-1 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {heading}
                        </a>
                    ))}
                </div>
            </nav>

            <div className="flex flex-col gap-12">
                {groupOrder.map((heading) => {
                    const shelves = grouped.get(heading)!
                    const sectionId = slugify(heading)
                    const sectionTotal = shelves.reduce(
                        (sum, s) => sum + s.count,
                        0
                    )
                    return (
                        <section
                            key={heading}
                            id={sectionId}
                            className="scroll-mt-24"
                        >
                            <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
                                <h2 className="font-heading text-xl tracking-tight">
                                    {heading}
                                </h2>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {shelves.length} list
                                    {shelves.length === 1 ? "" : "s"} ·{" "}
                                    {sectionTotal.toLocaleString()} books
                                </span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {shelves.map((shelf) => (
                                    <Link
                                        key={shelf.slug}
                                        href={`/bookshelves/${shelf.slug}`}
                                        className="group relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl border border-border/70 bg-card/40 px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-foreground/40 hover:bg-card hover:shadow-sm"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-primary/20 transition-all group-hover:inset-y-2 group-hover:bg-primary"
                                        />
                                        <span className="line-clamp-2 font-heading text-base leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
                                            {shelf.name}
                                        </span>
                                        <div className="flex items-end justify-between gap-2">
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                <span className="font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                                                    {shelf.count.toLocaleString()}
                                                </span>{" "}
                                                book{shelf.count === 1 ? "" : "s"}
                                            </span>
                                            <ArrowRight01Icon
                                                className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-foreground group-hover:opacity-100"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )
                })}
            </div>
        </div>
    )
}
