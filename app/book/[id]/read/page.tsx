import { cache } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookChatAssistant } from "@/components/book-chat-assistant"
import { ReaderTocMinimap } from "@/components/reader-toc-minimap"
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

interface ReaderSection {
    id: string
    title: string
    body: string
    includeInToc: boolean
}

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

    return trimDecorativeOpening(normalized.slice(startIndex, endIndex)).trim()
}

function trimDecorativeOpening(text: string) {
    const lines = text.trim().split("\n")
    const searchLimit = Math.min(lines.length, 220)
    const firstContentIndex = lines.findIndex((line, index) => {
        if (index > searchLimit) return false

        return /^(preface|introduction|prologue|chapter|book|volume|part)\b/i.test(
            line.trim()
        )
    })

    if (firstContentIndex <= 0 || firstContentIndex >= searchLimit) {
        return text
    }

    return lines.slice(firstContentIndex).join("\n")
}

function createSectionId(title: string, index: number) {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

    return slug ? `${slug}-${index + 1}` : `section-${index + 1}`
}

function getContentsLineIndexes(lines: string[]) {
    const indexes = new Set<number>()
    let isInContents = false
    let blankCount = 0

    lines.forEach((line, index) => {
        const trimmed = line.trim()

        if (/^contents\.?$/i.test(trimmed)) {
            isInContents = true
            blankCount = 0
            indexes.add(index)
            return
        }

        if (!isInContents) return

        indexes.add(index)

        if (trimmed) {
            blankCount = 0
            return
        }

        blankCount += 1
        if (blankCount >= 2) {
            isInContents = false
        }
    })

    return indexes
}

function isLikelySectionHeading(line: string, previous: string, next: string) {
    const title = line.trim().replace(/\s+/g, " ")
    if (!title || title.length > 96) return false

    const hasBreathingRoom = !previous.trim() && !next.trim()
    const sectionPatterns = [
        /^(chapter|letter|book|volume|part|canto|act|scene)\s+[\divxlcdm]+\.?(?:\s+.+)?$/i,
        /^(preface|introduction|prologue|epilogue|conclusion|dedication|appendix|etymology)\.?$/i,
        /^extracts(?:\s*\(.+\))?\.?$/i,
    ]

    if (sectionPatterns.some((pattern) => pattern.test(title))) return true

    const isUppercase =
        title === title.toUpperCase() &&
        /[A-Z]/.test(title) &&
        !/[a-z]/.test(title) &&
        !/[.!?]$/.test(title) &&
        title.length <= 48

    return hasBreathingRoom && isUppercase
}

function parseBookSections(text: string) {
    const lines = text.split("\n")
    const contentsLineIndexes = getContentsLineIndexes(lines)
    const sections: ReaderSection[] = []
    let currentTitle = ""
    let currentLines: string[] = []
    let sectionIndex = 0

    function pushCurrentSection() {
        const body = currentLines.join("\n").trim()
        if (!body && !currentTitle) return

        const title = currentTitle || "Opening"
        sections.push({
            id: createSectionId(title, sectionIndex),
            title,
            body,
            includeInToc: Boolean(currentTitle),
        })
        sectionIndex += 1
    }

    lines.forEach((line, index) => {
        const previous = lines[index - 1] ?? ""
        const next = lines[index + 1] ?? ""
        const isHeading =
            !contentsLineIndexes.has(index) &&
            isLikelySectionHeading(line, previous, next)

        if (isHeading) {
            pushCurrentSection()
            currentTitle = line.trim().replace(/\s+/g, " ")
            currentLines = []
            return
        }

        currentLines.push(line)
    })

    pushCurrentSection()

    if (sections.length <= 1) {
        return {
            tocItems: [],
            sections: [
                {
                    id: "full-text",
                    title: "Full Text",
                    body: text,
                    includeInToc: false,
                },
            ],
        }
    }

    return {
        tocItems: sections
            .filter((section) => section.includeInToc)
            .map(({ id, title }) => ({ id, title })),
        sections,
    }
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
    const parsedBook = bookText ? parseBookSections(bookText) : null

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

            {parsedBook ? (
                <>
                    <ReaderTocMinimap items={parsedBook.tocItems} />
                    <article
                        className="mx-auto flex w-full max-w-3xl flex-col gap-12"
                        data-reader-content
                    >
                        {parsedBook.sections.map((section, index) => (
                            <section
                                key={section.id}
                                id={section.id}
                                className="scroll-mt-28"
                            >
                                {section.includeInToc && (
                                    <h2 className="mb-5 border-b border-border pb-3 font-heading text-2xl tracking-tight text-body-strong sm:text-3xl retina:border-b-[0.5px]">
                                        {section.title}
                                    </h2>
                                )}
                                <pre
                                    className="font-sans text-base leading-8 break-words whitespace-pre-wrap text-body-strong sm:text-lg sm:leading-9"
                                    aria-label={
                                        parsedBook.tocItems.length > 0
                                            ? undefined
                                            : index === 0
                                              ? "Book text"
                                              : undefined
                                    }
                                >
                                    {section.body}
                                </pre>
                            </section>
                        ))}
                    </article>
                </>
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
