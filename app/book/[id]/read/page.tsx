import { cache } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ReaderShell } from "@/components/reader-shell"
import { getBookById as _getBookById } from "@/lib/gutendex-server"
import {
    getOnlineReadUrl,
    getReadableTextUrl,
    formatAuthorName,
} from "@/lib/gutendex"
import { defaultOgImage, siteName } from "@/lib/site-metadata"
import { ArrowUpRight03Icon, BookOpen01Icon } from "hugeicons-react"
import type { Metadata } from "next"
import type { ReaderBlock, ReaderSection } from "@/components/reader-types"

const getBookById = cache(_getBookById)
const ordinalWords =
    "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty"
const spelledPartPattern = new RegExp(
    `^part\\s+(?:${ordinalWords})\\b(?:\\s*[-–—]{1,2}\\s*.+)?$`,
    "i"
)

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

function createBlockId(sectionId: string, index: number) {
    return `${sectionId}-block-${index + 1}`
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
    if (spelledPartPattern.test(title) && hasBreathingRoom) return true

    const isUppercase =
        title === title.toUpperCase() &&
        /[A-Z]/.test(title) &&
        !/[a-z]/.test(title) &&
        !/[.!?]$/.test(title) &&
        title.length <= 48

    return hasBreathingRoom && isUppercase
}

function isLikelySplitRomanHeading(
    line: string,
    previous: string,
    next: string,
    afterNext: string
) {
    const roman = line.trim()
    const title = next.trim().replace(/\s+/g, " ")
    const hasBreathingRoom = !previous.trim() && !afterNext.trim()

    return (
        hasBreathingRoom &&
        /^[ivxlcdm]+\.?$/i.test(roman) &&
        title.length > 3 &&
        title.length <= 96 &&
        /[A-Za-z]/.test(title) &&
        !/[.!?]$/.test(title) &&
        !/\.{2,}|\s{3,}\d+$/.test(title)
    )
}

function isLikelyPreformattedBlock(lines: string[]) {
    if (lines.length <= 1) return false

    const nonEmptyLines = lines.filter((line) => line.trim())
    if (nonEmptyLines.length <= 1) return false

    const indentedLines = nonEmptyLines.filter((line) => /^\s{2,}/.test(line))
    const shortLines = nonEmptyLines.filter((line) => line.trim().length <= 52)
    const tableLikeLines = nonEmptyLines.filter((line) =>
        /\s{3,}\S/.test(line.trimEnd())
    )
    const uppercaseLines = nonEmptyLines.filter((line) => {
        const trimmed = line.trim()
        return (
            trimmed.length >= 3 &&
            trimmed.length <= 64 &&
            trimmed === trimmed.toUpperCase() &&
            /[A-Z]/.test(trimmed)
        )
    })

    return (
        indentedLines.length / nonEmptyLines.length >= 0.35 ||
        shortLines.length / nonEmptyLines.length >= 0.75 ||
        tableLikeLines.length >= 2 ||
        uppercaseLines.length >= 2
    )
}

function parseReaderBlocks(sectionId: string, text: string): ReaderBlock[] {
    const blocks: ReaderBlock[] = []
    const normalized = text.replace(/\n{3,}/g, "\n\n")
    const chunks = normalized.split(/\n\s*\n/)

    chunks.forEach((chunk) => {
        const lines = chunk.replace(/\s+$/g, "").split("\n")
        const isPreformatted = isLikelyPreformattedBlock(lines)
        const text = isPreformatted
            ? lines.join("\n")
            : lines
                  .map((line) => line.trim())
                  .join(" ")
                  .replace(/\s+/g, " ")

        if (!text.trim()) return

        blocks.push({
            id: createBlockId(sectionId, blocks.length),
            type: isPreformatted ? "pre" : "paragraph",
            text,
        })
    })

    return blocks
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
        const id = createSectionId(title, sectionIndex)
        sections.push({
            id,
            title,
            blocks: parseReaderBlocks(id, body),
            includeInToc: Boolean(currentTitle),
        })
        sectionIndex += 1
    }

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index] ?? ""
        const previous = lines[index - 1] ?? ""
        const next = lines[index + 1] ?? ""
        const afterNext = lines[index + 2] ?? ""
        const isSplitRomanHeading =
            !contentsLineIndexes.has(index) &&
            !contentsLineIndexes.has(index + 1) &&
            isLikelySplitRomanHeading(line, previous, next, afterNext)
        const isHeading =
            !contentsLineIndexes.has(index) &&
            isLikelySectionHeading(line, previous, next)

        if (isSplitRomanHeading) {
            pushCurrentSection()
            currentTitle = `${line.trim().replace(/\.$/, "")}. ${next
                .trim()
                .replace(/\s+/g, " ")}`
            currentLines = []
            index += 1
            continue
        }

        if (isHeading) {
            pushCurrentSection()
            currentTitle = line.trim().replace(/\s+/g, " ")
            currentLines = []
            continue
        }

        currentLines.push(line)
    }

    pushCurrentSection()

    if (sections.length <= 1) {
        return {
            tocItems: [],
            sections: [
                {
                    id: "full-text",
                    title: "Full Text",
                    blocks: parseReaderBlocks("full-text", text),
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

// Project Gutenberg's `/ebooks/{id}.txt.utf-8` alias 302-redirects through an
// insecure `http://` hop before reaching the real file. Cloudflare Workers'
// fetch (with `global_fetch_strictly_public`) refuses that downgrade, so the
// request fails in production while working locally under Node. Rewrite the
// alias to the canonical cache URL it points at, which responds 200 directly.
function normalizeBookTextUrl(url: string) {
    const match = url.match(
        /^https?:\/\/(?:www\.)?gutenberg\.org\/ebooks\/(\d+)\.txt\.utf-8$/i
    )
    if (!match) return url
    return `https://www.gutenberg.org/cache/epub/${match[1]}/pg${match[1]}.txt`
}

async function getBookText(url: string) {
    const res = await fetch(normalizeBookTextUrl(url), {
        next: { revalidate: 86400 },
    })
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
    let bookText: string | null = null
    if (textUrl) {
        try {
            bookText = await getBookText(textUrl)
        } catch {
            // Fall through to the "online text not available" view rather than
            // crashing the whole render when the upstream text fetch fails.
            bookText = null
        }
    }
    const parsedBook = bookText ? parseBookSections(bookText) : null

    return parsedBook ? (
        <ReaderShell
            bookId={book.id}
            title={book.title}
            authorName={authorName}
            languages={book.languages}
            isPublicDomain={book.copyright === false}
            sections={parsedBook.sections}
            tocItems={parsedBook.tocItems}
        />
    ) : (
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
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
                        Gutendex. You can still read it in the original reader
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
                            Open original reader
                            <ArrowUpRight03Icon
                                className="size-4"
                                aria-hidden="true"
                            />
                        </a>
                    </Button>
                )}
            </div>
        </div>
    )
}
