import { cache } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { DownloadLinks } from "@/components/download-links"
import { BookChatAssistant } from "@/components/book-chat-assistant"
import {
    getBookById as _getBookById,
    getCoverUrl,
    getOnlineReadUrl,
    getReadableTextUrl,
    formatAuthorName,
    formatDownloadCount,
} from "@/lib/gutendex"
import { defaultOgImage, siteName } from "@/lib/site-metadata"
import {
    ArrowLeft01Icon,
    BookOpen01Icon,
    ArrowDown01Icon,
    Calendar01Icon,
    ArrowUpRight03Icon,
} from "hugeicons-react"
import type { Metadata } from "next"

const getBookById = cache(_getBookById)

function formatBookshelfName(shelf: string) {
    return formatMetadataLabel(shelf.replace(/^Category:\s*/i, ""))
}

function formatMetadataLabel(label: string) {
    return label.replace(/\s*--\s*/g, " — ")
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    try {
        const book = await getBookById(Number(id))
        const description =
            book.summaries[0] ||
            `Read ${book.title} for free on Project Gutenberg`
        const authorNames = book.authors.map(formatAuthorName)
        const title = `${book.title} - ${siteName}`
        const url = `/book/${book.id}`

        return {
            title: book.title,
            description,
            authors: authorNames.length
                ? authorNames.map((name) => ({ name }))
                : [{ name: siteName }],
            creator: authorNames[0] || siteName,
            publisher: siteName,
            alternates: {
                canonical: url,
            },
            openGraph: {
                title,
                description,
                url,
                siteName,
                locale: "en_US",
                type: "book",
                authors: authorNames.length ? authorNames : undefined,
                tags: book.subjects.slice(0, 8),
                images: [defaultOgImage],
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [defaultOgImage.url],
            },
        }
    } catch {
        return { title: "Book" }
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
    const readableTextUrl = getReadableTextUrl(book)
    const onlineReadUrl = getOnlineReadUrl(book)

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Link href="/">
                <Button variant="link" size="sm" className="mb-8 gap-1.5">
                    <ArrowLeft01Icon className="size-4" aria-hidden="true" />
                    Back to books
                </Button>
            </Link>

            <div className="grid gap-8 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative aspect-[2/3] w-full max-w-[320px] overflow-hidden rounded-xl border border-border bg-muted">
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
                    {readableTextUrl ? (
                        <Button className="w-full max-w-[320px]" asChild>
                            <Link href={`/book/${book.id}/read`}>
                                <BookOpen01Icon
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Read online
                            </Link>
                        </Button>
                    ) : (
                        onlineReadUrl && (
                            <Button className="w-full max-w-[320px]" asChild>
                                <a
                                    href={onlineReadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <BookOpen01Icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Read online
                                    <ArrowUpRight03Icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </a>
                            </Button>
                        )
                    )}
                </div>

                <div className="flex min-w-0 flex-col gap-6">
                    <div>
                        <h1 className="font-heading text-3xl tracking-tight text-balance break-words md:text-4xl">
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

                    {book.summaries.length > 0 && (
                        <div>
                            <h3 className="font-heading text-lg">Summary</h3>
                            <Separator className="my-2" />
                            {book.summaries.map((summary, i) => (
                                <p
                                    key={i}
                                    className="text-sm leading-relaxed text-body-text"
                                >
                                    {summary}
                                </p>
                            ))}
                        </div>
                    )}

                    {book.subjects.length > 0 && (
                        <div>
                            <h3 className="font-heading text-lg">Subjects</h3>
                            <Separator className="my-2" />
                            <ul className="flex min-w-0 flex-wrap gap-2">
                                {book.subjects.map((subject) => (
                                    <li key={subject} className="max-w-full">
                                        <span className="inline-flex max-w-full rounded-md border border-hairline-soft bg-surface-soft px-2.5 py-1.5 text-sm leading-snug break-words whitespace-normal text-body-text">
                                            {formatMetadataLabel(subject)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {book.bookshelves.length > 0 && (
                        <div>
                            <h3 className="font-heading text-lg">
                                Bookshelves
                            </h3>
                            <Separator className="my-2" />
                            <ul className="flex min-w-0 flex-wrap gap-2">
                                {book.bookshelves.map((shelf) => (
                                    <li key={shelf} className="max-w-full">
                                        <span className="inline-flex max-w-full rounded-md bg-muted px-2.5 py-1.5 text-sm leading-snug break-words whitespace-normal text-muted-foreground">
                                            {formatBookshelfName(shelf)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {book.translators.length > 0 && (
                        <div>
                            <h3 className="font-heading text-lg">
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

            <div className="mt-12 rounded-xl bg-surface-dark p-8 text-on-dark">
                <DownloadLinks book={book} />
            </div>

            <BookChatAssistant bookId={book.id} title={book.title} />
        </div>
    )
}
