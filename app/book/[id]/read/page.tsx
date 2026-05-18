import { cache } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookChatAssistant } from "@/components/book-chat-assistant"
import { ReaderContent } from "@/components/reader-content"
import {
    getBookById as _getBookById,
    getOnlineReadUrl,
    getReadableTextUrl,
    formatAuthorName,
} from "@/lib/gutendex"
import { defaultOgImage, siteName } from "@/lib/site-metadata"
import {
    ArrowLeft01Icon,
    ArrowUpRight03Icon,
    BookOpen01Icon,
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
        const description =
            book.summaries[0] || `Read ${book.title} online with Project Sonam`
        const authorNames = book.authors.map(formatAuthorName)
        const title = `Read ${book.title} - ${siteName}`
        const url = `/book/${book.id}/read`

        return {
            title: `Read ${book.title}`,
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
        return { title: "Read Book" }
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

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
                <Button asChild variant="link" className="w-fit gap-2 px-0">
                    <Link href={`/book/${book.id}`}>
                        <ArrowLeft01Icon
                            className="size-4"
                            aria-hidden="true"
                        />
                        Book Details
                    </Link>
                </Button>

                <header className="flex flex-col gap-4 border-b border-border pb-6 retina:border-b-[0.5px]">
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

            {textUrl ? (
                <ReaderContent textUrl={textUrl} />
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
                            Gutendex. You can still read it in the original
                            reader when an HTML edition is available.
                        </p>
                    </div>
                    {onlineUrl && (
                        <Button asChild>
                            <a
                                href={onlineUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open original reader
                                <ArrowUpRight03Icon
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </a>
                        </Button>
                    )}
                </div>
            )}

            <BookChatAssistant
                bookId={book.id}
                title={book.title}
                launcherLabel="Ask AI"
                launcherTone="reader"
                enableSelectionAsk
            />
        </div>
    )
}
