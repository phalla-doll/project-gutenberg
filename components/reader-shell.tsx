"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BookChatAssistant } from "@/components/book-chat-assistant"
import { ReaderTocMinimap } from "@/components/reader-toc-minimap"
import { cn } from "@/lib/utils"
import {
    ArrowDown01Icon,
    ArrowLeft01Icon,
    ArrowUp01Icon,
    BookOpen01Icon,
    Cancel01Icon,
    ListViewIcon,
    Maximize01Icon,
    Minimize01Icon,
    ReloadIcon,
    Search01Icon,
    Settings02Icon,
} from "hugeicons-react"
import type {
    ReaderBlock,
    ReaderSection,
    ReaderTocItem,
} from "@/components/reader-types"
import type { CSSProperties, ReactNode } from "react"

interface ReaderShellProps {
    bookId: number
    title: string
    authorName: string
    languages: string[]
    isPublicDomain: boolean
    sections: ReaderSection[]
    tocItems: ReaderTocItem[]
}

type ReaderTheme = "light" | "sepia" | "dark"
type ReaderFont = "satoshi" | "sentient" | "quicksand"

interface ReaderPreferences {
    fontSize: number
    lineHeight: number
    contentWidth: number
    readerFont: ReaderFont
    theme: ReaderTheme
    focusMode: boolean
}

interface ReaderProgress {
    progress: number
    sectionId: string
    timestamp: number
}

interface SearchMatch {
    blockId: string
    start: number
    end: number
    index: number
}

const preferenceStorageKey = "project-sonam:reader:v1"
const defaultPreferences: ReaderPreferences = {
    fontSize: 18,
    lineHeight: 1.85,
    contentWidth: 38,
    readerFont: "satoshi",
    theme: "light",
    focusMode: false,
}

const readerFontFamilies: Record<ReaderFont, string> = {
    satoshi: "var(--font-reader-sans)",
    sentient: "var(--font-reader-serif)",
    quicksand: "var(--font-reader-soft)",
}

const themeStyles: Record<ReaderTheme, CSSProperties> = {
    light: {
        "--reader-background": "var(--background)",
        "--reader-surface": "var(--surface-soft)",
        "--reader-text": "var(--body-strong)",
        "--reader-muted": "var(--muted-foreground)",
        "--reader-border": "var(--border)",
        "--reader-highlight": "oklch(0.84 0.1 77 / 0.38)",
        "--reader-highlight-active": "oklch(0.8 0.12 62 / 0.58)",
    } as CSSProperties,
    sepia: {
        "--reader-background": "oklch(0.955 0.024 78)",
        "--reader-surface": "oklch(0.918 0.034 75)",
        "--reader-text": "oklch(0.27 0.021 64)",
        "--reader-muted": "oklch(0.48 0.026 66)",
        "--reader-border": "oklch(0.82 0.034 72)",
        "--reader-highlight": "oklch(0.78 0.1 70 / 0.42)",
        "--reader-highlight-active": "oklch(0.73 0.12 58 / 0.62)",
    } as CSSProperties,
    dark: {
        "--reader-background": "oklch(0.18 0.008 84)",
        "--reader-surface": "oklch(0.235 0.009 84)",
        "--reader-text": "oklch(0.9 0.006 88)",
        "--reader-muted": "oklch(0.66 0.01 88)",
        "--reader-border": "oklch(0.32 0.012 84)",
        "--reader-highlight": "oklch(0.64 0.11 70 / 0.38)",
        "--reader-highlight-active": "oklch(0.68 0.12 62 / 0.58)",
    } as CSSProperties,
}

function progressStorageKey(bookId: number) {
    return `project-sonam:reader-progress:${bookId}`
}

function readJson<T>(key: string) {
    try {
        const value = window.localStorage.getItem(key)
        return value ? (JSON.parse(value) as T) : null
    } catch {
        return null
    }
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

function isReaderFont(value: unknown): value is ReaderFont {
    return value === "satoshi" || value === "sentient" || value === "quicksand"
}

function getReaderFont(value: unknown) {
    if (value === "pally") return "quicksand"
    return isReaderFont(value) ? value : defaultPreferences.readerFont
}

function escapeSearchQuery(query: string) {
    return query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function getBlockMatches(
    block: ReaderBlock,
    query: string,
    startIndex: number
) {
    if (!query.trim()) return []

    const matches: SearchMatch[] = []
    const pattern = new RegExp(escapeSearchQuery(query.trim()), "gi")
    let match = pattern.exec(block.text)

    while (match) {
        matches.push({
            blockId: block.id,
            start: match.index,
            end: match.index + match[0].length,
            index: startIndex + matches.length,
        })
        match = pattern.exec(block.text)
    }

    return matches
}

function formatProgress(progress: number) {
    return `${clamp(progress, 0, 100).toFixed(0)}%`
}

export function ReaderShell({
    bookId,
    title,
    authorName,
    languages,
    isPublicDomain,
    sections,
    tocItems,
}: ReaderShellProps) {
    const [preferences, setPreferences] =
        useState<ReaderPreferences>(defaultPreferences)
    const [activeSectionId, setActiveSectionId] = useState(
        tocItems[0]?.id ?? sections[0]?.id ?? ""
    )
    const [readingProgress, setReadingProgress] = useState(0)
    const [savedProgress, setSavedProgress] = useState<ReaderProgress | null>(
        null
    )
    const [showResume, setShowResume] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [activeMatchIndex, setActiveMatchIndex] = useState(0)
    const hasLoadedStorage = useRef(false)
    const initialScrollY = useRef(0)
    const readerRef = useRef<HTMLElement>(null)
    const activeSectionRef = useRef(activeSectionId)

    const allBlocks = useMemo(
        () => sections.flatMap((section) => section.blocks),
        [sections]
    )

    const searchMatches = useMemo(() => {
        const matches: SearchMatch[] = []

        allBlocks.forEach((block) => {
            matches.push(...getBlockMatches(block, query, matches.length))
        })

        return matches
    }, [allBlocks, query])

    const matchesByBlock = useMemo(() => {
        const map = new Map<string, SearchMatch[]>()

        searchMatches.forEach((match) => {
            const blockMatches = map.get(match.blockId) ?? []
            blockMatches.push(match)
            map.set(match.blockId, blockMatches)
        })

        return map
    }, [searchMatches])

    const activeMatch = searchMatches[activeMatchIndex]

    useEffect(() => {
        const storedPreferences =
            readJson<Partial<ReaderPreferences>>(preferenceStorageKey)
        const storedProgress = readJson<ReaderProgress>(
            progressStorageKey(bookId)
        )

        const timeoutId = window.setTimeout(() => {
            if (storedPreferences) {
                setPreferences({
                    ...defaultPreferences,
                    ...storedPreferences,
                    fontSize: clamp(
                        Number(storedPreferences.fontSize) || 18,
                        16,
                        24
                    ),
                    lineHeight: clamp(
                        Number(storedPreferences.lineHeight) || 1.85,
                        1.55,
                        2.15
                    ),
                    contentWidth: clamp(
                        Number(storedPreferences.contentWidth) ||
                            defaultPreferences.contentWidth,
                        38,
                        64
                    ),
                    readerFont: getReaderFont(storedPreferences.readerFont),
                    theme:
                        storedPreferences.theme === "sepia" ||
                        storedPreferences.theme === "dark"
                            ? storedPreferences.theme
                            : "light",
                })
            }

            if (
                storedProgress &&
                storedProgress.progress > 3 &&
                storedProgress.progress < 98
            ) {
                setSavedProgress(storedProgress)
                setShowResume(true)
            }

            hasLoadedStorage.current = true
            initialScrollY.current = window.scrollY
        }, 0)

        return () => window.clearTimeout(timeoutId)
    }, [bookId])

    useEffect(() => {
        if (!hasLoadedStorage.current) return
        window.localStorage.setItem(
            preferenceStorageKey,
            JSON.stringify(preferences)
        )
    }, [preferences])

    useEffect(() => {
        document.body.dataset.readerFocus = preferences.focusMode
            ? "true"
            : "false"

        return () => {
            delete document.body.dataset.readerFocus
        }
    }, [preferences.focusMode])

    useEffect(() => {
        const ids = sections.map((section) => section.id)
        if (!ids.length) return

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top
                    )

                if (visible[0]) {
                    activeSectionRef.current = visible[0].target.id
                    setActiveSectionId(visible[0].target.id)
                }
            },
            { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
        )

        ids.forEach((id) => {
            const element = document.getElementById(id)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [sections])

    useEffect(() => {
        let frameId: number | null = null
        let saveTimeoutId: number | null = null

        const updateProgress = () => {
            frameId = null
            const readerContent = readerRef.current
            if (!readerContent) return

            const start = readerContent.offsetTop
            const end =
                readerContent.offsetTop +
                readerContent.scrollHeight -
                window.innerHeight
            const distance = Math.max(end - start, 1)
            const progress = clamp(
                ((window.scrollY - start) / distance) * 100,
                0,
                100
            )

            setReadingProgress(progress)

            if (
                showResume &&
                Math.abs(window.scrollY - initialScrollY.current) > 80
            ) {
                setShowResume(false)
            }

            if (saveTimeoutId !== null) window.clearTimeout(saveTimeoutId)
            saveTimeoutId = window.setTimeout(() => {
                window.localStorage.setItem(
                    progressStorageKey(bookId),
                    JSON.stringify({
                        progress,
                        sectionId: activeSectionRef.current,
                        timestamp: Date.now(),
                    })
                )
            }, 250)
        }

        const scheduleUpdate = () => {
            if (frameId !== null) return
            frameId = window.requestAnimationFrame(updateProgress)
        }

        scheduleUpdate()
        window.addEventListener("scroll", scheduleUpdate, { passive: true })
        window.addEventListener("resize", scheduleUpdate)

        return () => {
            if (frameId !== null) window.cancelAnimationFrame(frameId)
            if (saveTimeoutId !== null) window.clearTimeout(saveTimeoutId)
            window.removeEventListener("scroll", scheduleUpdate)
            window.removeEventListener("resize", scheduleUpdate)
        }
    }, [bookId, showResume])

    useEffect(() => {
        if (!activeMatch) return

        document
            .querySelector(`[data-search-match="${activeMatch.index}"]`)
            ?.scrollIntoView({ block: "center", behavior: "smooth" })
    }, [activeMatch])

    function updatePreferences(next: Partial<ReaderPreferences>) {
        setPreferences((current) => ({ ...current, ...next }))
    }

    function updateQuery(nextQuery: string) {
        setQuery(nextQuery)
        setActiveMatchIndex(0)
    }

    function closeSearch() {
        setIsSearchOpen(false)
        updateQuery("")
    }

    function continueReading() {
        if (!savedProgress) return

        const target = savedProgress.sectionId
            ? document.getElementById(savedProgress.sectionId)
            : null

        if (target) {
            target.scrollIntoView({ block: "start" })
        } else if (readerRef.current) {
            const readerContent = readerRef.current
            const start = readerContent.offsetTop
            const end =
                readerContent.offsetTop +
                readerContent.scrollHeight -
                window.innerHeight
            window.scrollTo({
                top:
                    start +
                    (Math.max(end - start, 1) * savedProgress.progress) / 100,
            })
        }

        setShowResume(false)
    }

    function moveMatch(direction: 1 | -1) {
        if (!searchMatches.length) return

        setActiveMatchIndex((current) => {
            const next = current + direction
            if (next < 0) return searchMatches.length - 1
            if (next >= searchMatches.length) return 0
            return next
        })
    }

    function renderBlockText(block: ReaderBlock) {
        const blockMatches = matchesByBlock.get(block.id)

        if (!blockMatches?.length) return block.text

        const nodes: ReactNode[] = []
        let cursor = 0

        blockMatches.forEach((match) => {
            if (match.start > cursor) {
                nodes.push(block.text.slice(cursor, match.start))
            }

            nodes.push(
                <mark
                    key={`${block.id}-${match.index}`}
                    data-search-match={match.index}
                    className={cn(
                        "bg-[var(--reader-highlight)] box-decoration-clone px-[0.08em] text-inherit transition-colors",
                        activeMatch?.index === match.index &&
                            "bg-[var(--reader-highlight-active)] shadow-[inset_0_-0.08em_0_var(--primary)]"
                    )}
                >
                    {block.text.slice(match.start, match.end)}
                </mark>
            )
            cursor = match.end
        })

        if (cursor < block.text.length) {
            nodes.push(block.text.slice(cursor))
        }

        return nodes
    }

    const readerStyle = {
        ...themeStyles[preferences.theme],
        "--reader-font-size": `${preferences.fontSize}px`,
        "--reader-line-height": preferences.lineHeight,
        "--reader-width": `${preferences.contentWidth}rem`,
        "--reader-content-font": readerFontFamilies[preferences.readerFont],
    } as CSSProperties

    return (
        <div
            className="min-h-svh bg-[var(--reader-background)] text-[var(--reader-text)] transition-colors"
            style={readerStyle}
        >
            <ReaderTocMinimap items={tocItems} activeId={activeSectionId} />

            <div
                className={cn(
                    "sticky z-40 border-b border-[var(--reader-border)] bg-[var(--reader-background)]/95 backdrop-blur",
                    preferences.focusMode ? "top-0" : "top-16"
                )}
            >
                <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:px-4 lg:px-6">
                    <Button asChild variant="ghost" size="icon-sm">
                        <Link
                            href={`/book/${bookId}`}
                            aria-label="Back to book details"
                        >
                            <ArrowLeft01Icon aria-hidden="true" />
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-heading text-base leading-tight text-[var(--reader-text)]">
                            {title}
                        </p>
                        <p className="hidden truncate text-xs text-[var(--reader-muted)] sm:block">
                            {authorName}
                        </p>
                    </div>
                    <div className="hidden items-center gap-2 text-xs font-semibold tracking-normal text-[var(--reader-muted)] tabular-nums sm:flex">
                        <ReaderProgressCircle value={readingProgress} />
                        <span>{formatProgress(readingProgress)}</span>
                    </div>
                    <div className="hidden items-center gap-1 sm:flex">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={
                                isSearchOpen
                                    ? "Close book search"
                                    : "Search in book"
                            }
                            aria-expanded={isSearchOpen}
                            onClick={() => {
                                if (isSearchOpen) {
                                    closeSearch()
                                    return
                                }
                                setIsSearchOpen(true)
                            }}
                        >
                            <Search01Icon aria-hidden="true" />
                        </Button>
                        <div className="xl:hidden">
                            <ReaderTocSheet
                                tocItems={tocItems}
                                activeSectionId={activeSectionId}
                            />
                        </div>
                        <ReaderPreferencesSheet
                            preferences={preferences}
                            onChange={updatePreferences}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={
                            preferences.focusMode
                                ? "Exit distraction-free mode"
                                : "Enter distraction-free mode"
                        }
                        onClick={() =>
                            updatePreferences({
                                focusMode: !preferences.focusMode,
                            })
                        }
                    >
                        {preferences.focusMode ? (
                            <Minimize01Icon aria-hidden="true" />
                        ) : (
                            <Maximize01Icon aria-hidden="true" />
                        )}
                    </Button>
                </div>
                {isSearchOpen && (
                    <ReaderSearchRow
                        query={query}
                        onQueryChange={updateQuery}
                        matchCount={searchMatches.length}
                        activeMatchIndex={activeMatchIndex}
                        onPrevious={() => moveMatch(-1)}
                        onNext={() => moveMatch(1)}
                        onClose={closeSearch}
                    />
                )}
            </div>

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-8 pb-28 sm:px-6 lg:px-8">
                {showResume && savedProgress && (
                    <div className="mx-auto flex w-full max-w-[var(--reader-width)] flex-wrap items-center justify-between gap-3 border border-[var(--reader-border)] bg-[var(--reader-surface)] px-4 py-3 text-sm text-[var(--reader-text)]">
                        <span className="font-medium">
                            Continue from{" "}
                            {formatProgress(savedProgress.progress)}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={continueReading}
                            >
                                Continue
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Dismiss resume prompt"
                                onClick={() => setShowResume(false)}
                            >
                                <Cancel01Icon aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
                )}

                <header className="mx-auto flex w-full max-w-[var(--reader-width)] flex-col gap-5 border-b border-[var(--reader-border)] pb-7">
                    <div className="flex flex-wrap gap-2">
                        {languages.map((lang) => (
                            <Badge key={lang} variant="secondary">
                                {lang.toUpperCase()}
                            </Badge>
                        ))}
                        {isPublicDomain && (
                            <Badge variant="outline">Public Domain</Badge>
                        )}
                    </div>
                    <div>
                        <h1 className="font-heading text-3xl tracking-tight text-balance break-words text-[var(--reader-text)] md:text-5xl">
                            {title}
                        </h1>
                        <p className="mt-2 text-lg text-[var(--reader-muted)]">
                            {authorName}
                        </p>
                    </div>
                </header>

                <article
                    ref={readerRef}
                    className="mx-auto flex w-full max-w-[var(--reader-width)] flex-col gap-12 [font-family:var(--reader-content-font)]"
                    data-reader-content
                >
                    {sections.map((section, sectionIndex) => (
                        <section
                            key={section.id}
                            id={section.id}
                            className="scroll-mt-32"
                        >
                            {section.includeInToc && (
                                <h2 className="mb-6 border-b border-[var(--reader-border)] pb-3 font-heading text-2xl tracking-tight text-[var(--reader-text)] sm:text-3xl">
                                    {section.title}
                                </h2>
                            )}
                            <div
                                className="flex flex-col gap-5"
                                aria-label={
                                    tocItems.length > 0
                                        ? undefined
                                        : sectionIndex === 0
                                          ? "Book text"
                                          : undefined
                                }
                            >
                                {section.blocks.map((block) =>
                                    block.type === "pre" ? (
                                        <pre
                                            key={block.id}
                                            id={block.id}
                                            className="overflow-x-auto [font-family:inherit] text-[length:var(--reader-font-size)] leading-[var(--reader-line-height)] break-words whitespace-pre-wrap text-[var(--reader-text)]"
                                        >
                                            {renderBlockText(block)}
                                        </pre>
                                    ) : (
                                        <p
                                            key={block.id}
                                            id={block.id}
                                            className="text-[length:var(--reader-font-size)] leading-[var(--reader-line-height)] text-[var(--reader-text)]"
                                        >
                                            {renderBlockText(block)}
                                        </p>
                                    )
                                )}
                            </div>
                        </section>
                    ))}
                </article>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--reader-border)] bg-[var(--reader-background)]/95 px-3 py-2 backdrop-blur sm:hidden">
                <div className="mx-auto flex max-w-md items-center gap-2">
                    <div className="min-w-0 flex-1">
                        <Progress value={readingProgress} />
                        <p className="mt-1 text-xs font-semibold tracking-normal text-[var(--reader-muted)] tabular-nums">
                            {formatProgress(readingProgress)}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={
                            isSearchOpen
                                ? "Close book search"
                                : "Search in book"
                        }
                        aria-expanded={isSearchOpen}
                        onClick={() => {
                            if (isSearchOpen) {
                                closeSearch()
                                return
                            }
                            setIsSearchOpen(true)
                        }}
                    >
                        <Search01Icon aria-hidden="true" />
                    </Button>
                    <ReaderTocSheet
                        tocItems={tocItems}
                        activeSectionId={activeSectionId}
                    />
                    <ReaderPreferencesSheet
                        preferences={preferences}
                        onChange={updatePreferences}
                    />
                </div>
            </div>

            <BookChatAssistant
                bookId={bookId}
                title={title}
                launcherLabel="Ask AI"
                launcherTone="reader"
                enableSelectionAsk
            />
        </div>
    )
}

function ReaderProgressCircle({ value }: { value: number }) {
    const radius = 8
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - clamp(value, 0, 100) / 100)

    return (
        <svg
            viewBox="0 0 20 20"
            className="size-5 shrink-0 -rotate-90"
            aria-hidden="true"
        >
            <circle
                cx="10"
                cy="10"
                r={radius}
                className="fill-none stroke-[var(--reader-border)]"
                strokeWidth="2"
            />
            <circle
                cx="10"
                cy="10"
                r={radius}
                className="fill-none stroke-primary transition-[stroke-dashoffset]"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
            />
        </svg>
    )
}

function ReaderSearchRow({
    query,
    onQueryChange,
    matchCount,
    activeMatchIndex,
    onPrevious,
    onNext,
    onClose,
}: {
    query: string
    onQueryChange: (query: string) => void
    matchCount: number
    activeMatchIndex: number
    onPrevious: () => void
    onNext: () => void
    onClose: () => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    return (
        <div className="border-t border-[var(--reader-border)]">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:px-4 lg:px-6">
                <div className="relative min-w-0 flex-1">
                    <Search01Icon
                        className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-[var(--reader-muted)]"
                        aria-hidden="true"
                    />
                    <Input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") {
                                event.preventDefault()
                                onClose()
                            }
                            if (event.key === "Enter" && matchCount) {
                                event.preventDefault()
                                if (event.shiftKey) {
                                    onPrevious()
                                } else {
                                    onNext()
                                }
                            }
                        }}
                        placeholder="Search this book..."
                        aria-label="Search this book"
                        autoComplete="off"
                        className="pl-7"
                    />
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="min-w-20 text-xs font-semibold tracking-normal text-[var(--reader-muted)] tabular-nums">
                        {query.trim()
                            ? matchCount
                                ? `${activeMatchIndex + 1} of ${matchCount}`
                                : "No matches"
                            : "Search"}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label="Previous match"
                            disabled={!matchCount}
                            onClick={onPrevious}
                        >
                            <ArrowUp01Icon aria-hidden="true" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label="Next match"
                            disabled={!matchCount}
                            onClick={onNext}
                        >
                            <ArrowDown01Icon aria-hidden="true" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Close book search"
                            onClick={onClose}
                        >
                            <Cancel01Icon aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ReaderTocSheet({
    tocItems,
    activeSectionId,
}: {
    tocItems: ReaderTocItem[]
    activeSectionId: string
}) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm">
                    <ListViewIcon aria-hidden="true" />
                    <span className="sr-only">Open table of contents</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Contents</SheetTitle>
                </SheetHeader>
                <nav
                    className="flex max-h-[calc(100svh-10rem)] flex-col gap-1 overflow-y-auto px-8 pb-8"
                    aria-label="Book sections"
                >
                    {tocItems.length ? (
                        tocItems.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                aria-current={
                                    activeSectionId === item.id
                                        ? "location"
                                        : undefined
                                }
                                className={cn(
                                    "border-l-2 border-transparent px-3 py-2 text-sm leading-snug text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                                    activeSectionId === item.id &&
                                        "border-primary bg-muted text-foreground"
                                )}
                            >
                                {item.title}
                            </a>
                        ))
                    ) : (
                        <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                            <BookOpen01Icon
                                className="size-9"
                                aria-hidden="true"
                            />
                            <p className="text-sm">
                                This text does not include detected sections.
                            </p>
                        </div>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    )
}

function ReaderPreferencesSheet({
    preferences,
    onChange,
}: {
    preferences: ReaderPreferences
    onChange: (next: Partial<ReaderPreferences>) => void
}) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm">
                    <Settings02Icon aria-hidden="true" />
                    <span className="sr-only">Open reader settings</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Reader Settings</SheetTitle>
                    <SheetDescription>
                        Adjust the reading view on this browser.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-7 px-8 pb-8">
                    <PreferenceSlider
                        label="Text size"
                        value={preferences.fontSize}
                        min={16}
                        max={24}
                        step={1}
                        suffix="px"
                        onChange={(fontSize) => onChange({ fontSize })}
                    />
                    <PreferenceSlider
                        label="Line height"
                        value={preferences.lineHeight}
                        min={1.55}
                        max={2.15}
                        step={0.05}
                        suffix="x"
                        onChange={(lineHeight) => onChange({ lineHeight })}
                    />
                    <PreferenceSlider
                        label="Text width"
                        value={preferences.contentWidth}
                        min={38}
                        max={64}
                        step={2}
                        suffix="rem"
                        onChange={(contentWidth) => onChange({ contentWidth })}
                    />
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-semibold">Font face</div>
                        <ToggleGroup
                            type="single"
                            value={preferences.readerFont}
                            onValueChange={(readerFont) => {
                                if (isReaderFont(readerFont)) {
                                    onChange({ readerFont })
                                }
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            <ToggleGroupItem value="satoshi" className="flex-1">
                                Default
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="sentient"
                                className="flex-1"
                            >
                                Classic
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="quicksand"
                                className="flex-1"
                            >
                                Soft
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-semibold">Theme</div>
                        <ToggleGroup
                            type="single"
                            value={preferences.theme}
                            onValueChange={(theme) => {
                                if (
                                    theme === "light" ||
                                    theme === "sepia" ||
                                    theme === "dark"
                                ) {
                                    onChange({ theme })
                                }
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            <ToggleGroupItem value="light" className="flex-1">
                                Light
                            </ToggleGroupItem>
                            <ToggleGroupItem value="sepia" className="flex-1">
                                Sepia
                            </ToggleGroupItem>
                            <ToggleGroupItem value="dark" className="flex-1">
                                Dark
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <Button
                        type="button"
                        variant={
                            preferences.focusMode ? "secondary" : "outline"
                        }
                        className="justify-start"
                        onClick={() =>
                            onChange({ focusMode: !preferences.focusMode })
                        }
                    >
                        {preferences.focusMode ? (
                            <Minimize01Icon aria-hidden="true" />
                        ) : (
                            <Maximize01Icon aria-hidden="true" />
                        )}
                        {preferences.focusMode
                            ? "Exit Focus Mode"
                            : "Enter Focus Mode"}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="justify-start"
                        onClick={() => onChange(defaultPreferences)}
                    >
                        <ReloadIcon aria-hidden="true" />
                        Reset Settings
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

function PreferenceSlider({
    label,
    value,
    min,
    max,
    step,
    suffix,
    onChange,
}: {
    label: string
    value: number
    min: number
    max: number
    step: number
    suffix: string
    onChange: (value: number) => void
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold">{label}</span>
                <span className="text-muted-foreground tabular-nums">
                    {Number.isInteger(value) ? value : value.toFixed(2)}
                    {suffix}
                </span>
            </div>
            <Slider
                value={[value]}
                min={min}
                max={max}
                step={step}
                onValueChange={(values) => onChange(values[0] ?? value)}
                aria-label={label}
            />
        </div>
    )
}
