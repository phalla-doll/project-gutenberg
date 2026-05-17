import { cache } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    getBookById as _getBookById,
    getOnlineReadUrl,
    getReadableTextUrl,
    formatAuthorName,
} from "@/lib/gutendex"
import {
    ArrowLeft01Icon,
    ArrowUpRight03Icon,
    BookOpen01Icon,
} from "hugeicons-react"
import type { Metadata } from "next"

const getBookById = cache(_getBookById)

function trimProjectGutenbergText(text: string) {
    const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n")
    const startMarker = normalized.match(
        /\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i
    )
    const endMarker = normalized.match(
        /\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*$/i
    )
    const startIndex = startMarker
        ? startMarker.index! + startMarker[0].length
        : 0
    const endIndex = endMarker?.index ?? normalized.length

    return normalized.slice(startIndex, endIndex).trim()
}

async function getBookText(url: string) {
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`Failed to fetch book text: ${res.status}`)
    return trimProjectGutenbergText(await res.text())
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    try {
        const book = await getBookById(Number(id))
        return {
            title: `Read ${book.title} - Project Gutenberg`,
            description:
                book.summaries[0] ||
                `Read ${book.title} online from Project Gutenberg`,
        }
    } catch {
        return { title: "Read Book - Project Gutenberg" }
    }
}

export default async function BookReaderPage({
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

    const textUrl = getReadableTextUrl(book)
    const onlineUrl = getOnlineReadUrl(book)
    const author = book.authors[0]
    const authorName = author ? formatAuthorName(author) : "Unknown Author"
    const bookText = textUrl ? await getBookText(textUrl) : null

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
                <Button
                    variant="link"
                    size="sm"
                    className="w-fit gap-1.5"
                    asChild
                >
                    <Link href={`/book/${book.id}`}>
                        <ArrowLeft01Icon
                            className="size-4"
                            aria-hidden="true"
                        />
                        Book details
                    </Link>
                </Button>

                <header className="flex flex-col gap-4 border-b border-border pb-6">
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
                    <div>
                        <h1 className="font-heading text-3xl tracking-tight text-balance break-words md:text-5xl">
                            {book.title}
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            {authorName}
                        </p>
                    </div>
                </header>
            </div>

            {bookText ? (
                <article className="mx-auto w-full max-w-3xl">
                    <pre className="font-sans text-base leading-8 break-words whitespace-pre-wrap text-body-strong sm:text-lg sm:leading-9">
                        {bookText}
                    </pre>
                </article>
            ) : (
                <div className="flex min-h-[45svh] flex-col items-center justify-center gap-5 rounded-xl border border-border bg-card px-6 py-16 text-center">
                    <BookOpen01Icon
                        className="size-12 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <div className="flex max-w-md flex-col gap-2">
                        <h2 className="font-heading text-2xl">
                            Online text is not available
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            This title does not include a plain text edition in
                            Gutendex. You can still read it on Project Gutenberg
                            when an HTML edition is available.
                        </p>
                    </div>
                    {onlineUrl && (
                        <Button asChild>
                            <a
                                href={onlineUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open Gutenberg
                                <ArrowUpRight03Icon
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </a>
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
