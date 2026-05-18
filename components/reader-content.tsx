"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ReaderTocMinimap } from "@/components/reader-toc-minimap"
import type { ReaderTocItem } from "@/components/reader-toc-minimap"

interface ReaderSection {
    id: string
    title: string
    body: string
    includeInToc: boolean
}

interface ParsedBook {
    tocItems: ReaderTocItem[]
    sections: ReaderSection[]
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

function parseBookSections(text: string): ParsedBook {
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

const BUFFER = 3

function LazySection({
    section,
    isVisible,
    innerRef,
    hasTocItems,
    index,
}: {
    section: ReaderSection
    isVisible: boolean
    innerRef: (el: HTMLElement | null) => void
    hasTocItems: boolean
    index: number
}) {
    const estimatedHeight = useMemo(() => {
        const lineCount = section.body.split("\n").length
        return Math.max(lineCount * 28 + 100, 200)
    }, [section.body])

    if (!isVisible) {
        return (
            <section
                ref={innerRef}
                id={section.id}
                className="scroll-mt-28"
                style={{ minHeight: estimatedHeight }}
            />
        )
    }

    return (
        <section ref={innerRef} id={section.id} className="scroll-mt-28">
            {section.includeInToc && (
                <h2 className="mb-5 border-b border-border pb-3 font-heading text-2xl tracking-tight text-body-strong sm:text-3xl retina:border-b-[0.5px]">
                    {section.title}
                </h2>
            )}
            <pre
                className="font-sans text-base leading-8 break-words whitespace-pre-wrap text-body-strong sm:text-lg sm:leading-9"
                aria-label={
                    hasTocItems
                        ? undefined
                        : index === 0
                          ? "Book text"
                          : undefined
                }
            >
                {section.body}
            </pre>
        </section>
    )
}

function ReaderSkeleton() {
    return (
        <div
            className="mx-auto flex w-full max-w-3xl flex-col gap-12"
            data-reader-content
        >
            <div className="flex flex-col gap-4">
                <Skeleton className="h-8 w-48" />
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <Skeleton className="h-7 w-36" />
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <Skeleton className="h-7 w-40" />
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        </div>
    )
}

function ReaderError({
    message,
    onRetry,
}: {
    message: string
    onRetry: () => void
}) {
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
            <button
                onClick={onRetry}
                className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
                Try again
            </button>
        </div>
    )
}

export function ReaderContent({ textUrl }: { textUrl: string }) {
    const [parsedBook, setParsedBook] = useState<ParsedBook | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [visibleSections, setVisibleSections] = useState<Set<number>>(
        () => new Set([0, 1, 2, 3])
    )
    const sectionRefs = useRef<(HTMLElement | null)[]>([])
    const fetchedRef = useRef(false)

    const fetchText = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(textUrl)
            if (!res.ok)
                throw new Error(`Failed to fetch book text: ${res.status}`)
            const rawText = await res.text()
            const trimmed = trimProjectGutenbergText(rawText)
            const parsed = parseBookSections(trimmed)
            setParsedBook(parsed)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load book text"
            )
        } finally {
            setLoading(false)
        }
    }, [textUrl])

    useEffect(() => {
        if (!fetchedRef.current) {
            fetchedRef.current = true
            fetchText()
        }
    }, [fetchText])

    useEffect(() => {
        if (!parsedBook) return

        const observer = new IntersectionObserver(
            (entries) => {
                setVisibleSections((prev) => {
                    const next = new Set(prev)
                    for (const entry of entries) {
                        const idx = sectionRefs.current.indexOf(
                            entry.target as HTMLElement
                        )
                        if (idx === -1) continue
                        if (entry.isIntersecting) {
                            for (
                                let i = Math.max(0, idx - BUFFER);
                                i <=
                                Math.min(
                                    parsedBook.sections.length - 1,
                                    idx + BUFFER
                                );
                                i++
                            ) {
                                next.add(i)
                            }
                        }
                    }
                    return next.size === prev.size ? prev : next
                })
            },
            { rootMargin: "200% 0px" }
        )

        const currentRefs = sectionRefs.current
        currentRefs.forEach((el) => {
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [parsedBook])

    if (loading) return <ReaderSkeleton />

    if (error) return <ReaderError message={error} onRetry={fetchText} />

    if (!parsedBook) return null

    return (
        <>
            <ReaderTocMinimap items={parsedBook.tocItems} />
            <article
                className="mx-auto flex w-full max-w-3xl flex-col gap-12"
                data-reader-content
            >
                {parsedBook.sections.map((section, index) => (
                    <LazySection
                        key={section.id}
                        section={section}
                        isVisible={visibleSections.has(index)}
                        innerRef={(el) => {
                            sectionRefs.current[index] = el
                        }}
                        hasTocItems={parsedBook.tocItems.length > 0}
                        index={index}
                    />
                ))}
            </article>
        </>
    )
}
