import Link from "next/link"
import { Book3DPreview } from "@/components/book-3d-preview"
import { BookMoreMenu } from "@/components/book-more-menu"
import { DownloadLinks } from "@/components/download-links"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    type Book,
    formatAuthorName,
    formatDownloadCount,
    getCoverUrl,
    getLanguageName,
    getOnlineReadUrl,
    getReadableTextUrl,
} from "@/lib/gutendex"
import { cn } from "@/lib/utils"
import {
    ArrowDown01Icon,
    ArrowRight01Icon,
    ArrowUpRight03Icon,
    BookOpen01Icon,
} from "hugeicons-react"

function formatMetadataLabel(label: string) {
    return label.replace(/\s*--\s*/g, " — ")
}

function formatBookshelfName(shelf: string) {
    return formatMetadataLabel(shelf.replace(/^Category:\s*/i, ""))
}

function bookshelfSlug(shelf: string) {
    return shelf
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
}

interface BookDetailProps {
    book: Book
    variant?: "page" | "dialog"
}

export function BookDetail({ book, variant = "page" }: BookDetailProps) {
    const isDialog = variant === "dialog"
    const coverUrl = getCoverUrl(book)
    const mainAuthor = book.authors[0]
    const authorName = mainAuthor
        ? formatAuthorName(mainAuthor)
        : "Unknown Author"
    const readableTextUrl = getReadableTextUrl(book)
    const onlineReadUrl = getOnlineReadUrl(book)

    const heading = (
        <h1
            className={cn(
                "font-heading tracking-tight text-balance wrap-break-word",
                isDialog
                    ? "text-3xl md:text-[2.5rem] md:leading-tight"
                    : "text-3xl md:text-4xl"
            )}
        >
            {book.title}
        </h1>
    )

    const readButton = readableTextUrl ? (
        <Button className="w-full" asChild>
            <Link href={`/book/${book.id}/read`}>
                <BookOpen01Icon className="size-4" aria-hidden="true" />
                Read online
            </Link>
        </Button>
    ) : onlineReadUrl ? (
        <Button className="w-full" asChild>
            <a href={onlineReadUrl} target="_blank" rel="noopener noreferrer">
                <BookOpen01Icon className="size-4" aria-hidden="true" />
                Read online
                <ArrowUpRight03Icon className="size-4" aria-hidden="true" />
            </a>
        </Button>
    ) : null

    const showcase = (
        <div
            className={cn(
                "flex flex-col items-center",
                isDialog && "md:h-full md:justify-center md:pb-6"
            )}
        >
            <Book3DPreview
                title={book.title}
                coverUrl={coverUrl}
                width={isDialog ? 220 : 240}
            />
            <div className="flex w-full max-w-[280px] flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowDown01Icon className="size-4" aria-hidden="true" />
                    {formatDownloadCount(book.download_count)} downloads
                </div>
                {readButton}
                {isDialog ? <BookMoreMenu book={book} /> : null}
            </div>
        </div>
    )

    const details = (
        <div className="flex min-w-0 flex-col gap-6">
            <div>
                {heading}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                    <p className="text-lg">{authorName}</p>
                    {mainAuthor &&
                        (mainAuthor.birth_year || mainAuthor.death_year) && (
                            <>
                                <span
                                    className="size-1 rounded-full bg-muted-foreground/50"
                                    aria-hidden="true"
                                />
                                <span className="text-sm">
                                    {mainAuthor.birth_year || "?"} &ndash;{" "}
                                    {mainAuthor.death_year || "?"}
                                </span>
                            </>
                        )}
                    {book.languages.length > 0 && (
                        <>
                            <span
                                className="size-1 rounded-full bg-muted-foreground/50"
                                aria-hidden="true"
                            />
                            <span className="text-sm">
                                {book.languages.map(getLanguageName).join(", ")}
                            </span>
                        </>
                    )}
                </div>
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
                                <span className="inline-flex max-w-full rounded-md bg-secondary px-2.5 py-1.5 text-sm leading-snug wrap-break-word whitespace-normal text-secondary-foreground">
                                    {formatMetadataLabel(subject)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {book.bookshelves.length > 0 && (
                <div>
                    <h3 className="font-heading text-lg">Bookshelves</h3>
                    <Separator className="my-2" />
                    <ul className="flex min-w-0 flex-wrap gap-2">
                        {book.bookshelves.map((shelf) => (
                            <li key={shelf} className="max-w-full">
                                <Link
                                    href={`/bookshelves/${bookshelfSlug(shelf)}`}
                                    className="group/shelf inline-flex max-w-full items-center gap-1.5 rounded-md border border-foreground/15 bg-background py-1.5 pr-2 pl-2.5 text-sm leading-snug wrap-break-word whitespace-normal text-foreground transition-colors outline-none hover:border-foreground/40 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/50"
                                >
                                    {formatBookshelfName(shelf)}
                                    <ArrowRight01Icon
                                        className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover/shelf:translate-x-0.5 group-hover/shelf:text-foreground"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {book.translators.length > 0 && (
                <div>
                    <h3 className="font-heading text-lg">Translators</h3>
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
    )

    const downloads = (
        <div
            className={cn(
                "rounded-xl bg-surface-dark text-on-dark",
                "mt-12 p-8"
            )}
        >
            <DownloadLinks book={book} />
        </div>
    )

    if (isDialog) {
        return (
            <div className="md:grid md:h-full md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                <div className="pt-10 md:pt-0">{showcase}</div>
                <div className="flex min-w-0 flex-col gap-8 px-6 pt-4 pb-6 md:overflow-y-auto md:py-12 md:pr-12 md:pl-4">
                    {details}
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="grid gap-8 md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr]">
                {showcase}
                {details}
            </div>
            {downloads}
        </>
    )
}
