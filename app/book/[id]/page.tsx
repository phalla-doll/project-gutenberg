import { cache } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { DownloadLinks } from "@/components/download-links"
import {
    getBookById as _getBookById,
    getCoverUrl,
    formatAuthorName,
    formatDownloadCount,
} from "@/lib/gutendex"
import {
    ArrowLeft01Icon,
    BookOpen01Icon,
    ArrowDown01Icon,
    Calendar01Icon,
} from "hugeicons-react"
import type { Metadata } from "next"

const getBookById = cache(_getBookById)

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    try {
        const book = await getBookById(Number(id))
        return {
            title: `${book.title} - Project Gutenberg`,
            description:
                book.summaries[0] ||
                `Read ${book.title} for free on Project Gutenberg`,
        }
    } catch {
        return { title: "Book - Project Gutenberg" }
    }
}

export default async function BookDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    let book
    try {
        book = await getBookById(Number(id))
    } catch {
        notFound()
    }

    const coverUrl = getCoverUrl(book)
    const mainAuthor = book.authors[0]
    const authorName = mainAuthor
        ? formatAuthorName(mainAuthor)
        : "Unknown Author"

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Link href="/">
                <Button variant="ghost" size="sm" className="mb-6 gap-1.5">
                    <ArrowLeft01Icon className="size-4" aria-hidden="true" />
                    Back to books
                </Button>
            </Link>

            <div className="grid gap-8 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative aspect-[2/3] w-full max-w-[320px] overflow-hidden rounded-lg border border-border bg-muted shadow-lg">
                        {coverUrl ? (
                            <Image
                                src={coverUrl}
                                alt={book.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 320px"
                                priority
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center">
                                <BookOpen01Icon
                                    className="size-24 text-muted-foreground/40"
                                    aria-hidden="true"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowDown01Icon
                            className="size-4"
                            aria-hidden="true"
                        />
                        {formatDownloadCount(book.download_count)} downloads
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-balance break-words md:text-3xl lg:text-4xl">
                            {book.title}
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            {authorName}
                        </p>
                        {mainAuthor &&
                            (mainAuthor.birth_year ||
                                mainAuthor.death_year) && (
                                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar01Icon
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                    {mainAuthor.birth_year || "?"} &ndash;{" "}
                                    {mainAuthor.death_year || "?"}
                                </div>
                            )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {book.languages.map((lang) => (
                            <Badge key={lang} variant="secondary">
                                {lang.toUpperCase()}
                            </Badge>
                        ))}
                        {book.copyright === false && (
                            <Badge variant="outline">Public Domain</Badge>
                        )}
                    </div>

                    <DownloadLinks book={book} />

                    {book.summaries.length > 0 && (
                        <div>
                            <h3 className="font-heading text-lg font-semibold">
                                Summary
                            </h3>
                            <Separator className="my-2" />
                            {book.summaries.map((summary, i) => (
                                <p
                                    key={i}
                                    className="text-sm leading-relaxed text-muted-foreground"
                                >
                                    {summary}
                                </p>
                            ))}
                        </div>
                    )}

                    {book.subjects.length > 0 && (
                        <div>
                            <h3 className="font-heading text-lg font-semibold">
                                Subjects
                            </h3>
                            <Separator className="my-2" />
                            <div className="flex flex-wrap gap-1.5">
                                {book.subjects.map((subject) => (
                                    <Badge
                                        key={subject}
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {subject}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {book.bookshelves.length > 0 && (
                        <div>
                            <h3 className="font-heading text-lg font-semibold">
                                Bookshelves
                            </h3>
                            <Separator className="my-2" />
                            <div className="flex flex-wrap gap-1.5">
                                {book.bookshelves.map((shelf) => (
                                    <Badge
                                        key={shelf}
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {shelf}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {book.translators.length > 0 && (
                        <div>
                            <h3 className="font-heading text-lg font-semibold">
                                Translators
                            </h3>
                            <Separator className="my-2" />
                            <div className="flex flex-wrap gap-1.5">
                                {book.translators.map((t) => (
                                    <Badge key={t.name} variant="outline">
                                        {formatAuthorName(t)}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
