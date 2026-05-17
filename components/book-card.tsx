import type { CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen01Icon } from "hugeicons-react"
import { type Book, getCoverUrl, formatAuthorName } from "@/lib/gutendex"
import { cn } from "@/lib/utils"

interface BookCardProps {
    book: Book
}

const coverThemes = [
    {
        cover: "oklch(0.658 0.113 39.1)",
        lower: "oklch(0.936 0.016 82.8)",
        text: "oklch(0.191 0.002 106.6)",
        accent: "oklch(0.721 0.092 179)",
        paper: "oklch(0.94 0.014 84)",
    },
    {
        cover: "oklch(0.552 0.113 38.5)",
        lower: "oklch(0.957 0.012 79.8)",
        text: "oklch(0.191 0.002 106.6)",
        accent: "oklch(0.772 0.121 67.4)",
        paper: "oklch(0.948 0.013 78)",
    },
    {
        cover: "oklch(0.257 0.006 78.2)",
        lower: "oklch(0.909 0.021 81.8)",
        text: "oklch(0.191 0.002 106.6)",
        accent: "oklch(0.708 0.134 149.4)",
        paper: "oklch(0.918 0.012 82)",
    },
    {
        cover: "oklch(0.708 0.134 149.4)",
        lower: "oklch(0.957 0.012 79.8)",
        text: "oklch(0.191 0.002 106.6)",
        accent: "oklch(0.658 0.113 39.1)",
        paper: "oklch(0.952 0.014 86)",
    },
]

export function BookCard({ book }: BookCardProps) {
    const coverUrl = getCoverUrl(book)
    const author = book.authors[0]
    const authorName = author ? formatAuthorName(author) : "Unknown Author"
    const theme = coverThemes[book.id % coverThemes.length]
    const languages = book.languages.slice(0, 2).join(" / ").toUpperCase()
    const bookStyle = {
        "--book-cover": theme.cover,
        "--book-lower": theme.lower,
        "--book-text": theme.text,
        "--book-accent": theme.accent,
        "--book-paper": theme.paper,
    } as CSSProperties

    return (
        <Link href={`/book/${book.id}`} className="block h-full">
            <Card className="group h-full gap-0 overflow-visible rounded-md bg-transparent py-0 shadow-none ring-0">
                <div
                    className="mx-auto w-full max-w-[196px] pt-1"
                    style={{ perspective: 900 }}
                >
                    <div
                        className="relative aspect-[49/60] transition-transform duration-300 ease-out group-hover:rotate-x-2 group-hover:-rotate-y-10"
                        style={{
                            transformStyle: "preserve-3d",
                        }}
                    >
                        <div className="absolute inset-x-[8%] -bottom-[3.2%] h-[8%] rounded-[50%] bg-foreground/14 blur-[14px] transition-all duration-300 group-hover:translate-x-[1.5%] group-hover:bg-foreground/18" />
                        <div
                            className="absolute inset-[2px] translate-x-[1.5%] translate-y-[1.2%] rounded-l-md rounded-r-sm bg-[var(--book-paper)] shadow-[0_4px_8px_rgba(20,20,19,0.08)]"
                            style={{
                                transform: "translateZ(-3px)",
                            }}
                        />
                        <div
                            className="[container-type:inline-size] relative size-full overflow-hidden rounded-l-md rounded-r-sm bg-[var(--book-paper)] shadow-[0_16px_26px_rgba(20,20,19,0.14),0_2px_5px_rgba(20,20,19,0.08)] ring-1 ring-foreground/10"
                            style={bookStyle}
                        >
                            {coverUrl ? (
                                <>
                                    <Image
                                        src={coverUrl}
                                        alt=""
                                        fill
                                        className="scale-110 object-cover opacity-18 blur-md brightness-110 saturate-50"
                                        sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 15vw"
                                        aria-hidden="true"
                                    />
                                    <div className="absolute inset-0 bg-[var(--book-paper)]/65" />
                                    <Image
                                        src={coverUrl}
                                        alt={book.title}
                                        fill
                                        className="object-contain drop-shadow-[0_1px_1px_rgba(20,20,19,0.14)]"
                                        sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 15vw"
                                    />
                                </>
                            ) : (
                                <div className="flex size-full flex-col overflow-hidden">
                                    <div className="relative flex-1 overflow-hidden bg-[var(--book-cover)]">
                                        <div className="absolute inset-y-0 left-0 w-[8.2%] bg-foreground/20 mix-blend-overlay" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-90">
                                            <BookOpen01Icon
                                                className="size-16 text-primary-foreground/80"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative flex flex-[1.35] flex-col justify-between bg-[var(--book-lower)] p-[6.1%] pl-[14.3%]">
                                        <div className="absolute inset-y-0 left-0 w-[8.2%] bg-foreground/10" />
                                        <h3
                                            className="line-clamp-4 text-[10.5cqw] leading-tight font-semibold text-balance"
                                            style={{
                                                color: "var(--book-text)",
                                            }}
                                        >
                                            {book.title}
                                        </h3>
                                        <div
                                            className="size-5"
                                            style={{
                                                color: "var(--book-accent)",
                                            }}
                                            aria-hidden="true"
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="size-full fill-current"
                                            >
                                                <path d="M21 21H3L12 3Z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-[11%] bg-[linear-gradient(90deg,rgba(20,20,19,0.16),rgba(255,255,255,0.12)_38%,transparent_76%)] mix-blend-multiply" />
                            <div className="pointer-events-none absolute inset-y-0 left-[5.5%] w-px bg-white/35" />
                            <div className="pointer-events-none absolute inset-y-0 left-[8.5%] w-[5%] bg-[linear-gradient(90deg,rgba(255,255,255,0.18),transparent)] mix-blend-screen" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-[2%] bg-[linear-gradient(270deg,rgba(20,20,19,0.08),transparent)] mix-blend-multiply" />
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[7%] bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)] mix-blend-screen" />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%] bg-[linear-gradient(0deg,rgba(20,20,19,0.08),transparent)] mix-blend-multiply" />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.08)_32%,transparent_44%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                        <div className="absolute top-[4px] right-[-3.8%] h-[calc(100%-8px)] w-[6%] origin-left rotate-y-90 rounded-r-sm bg-[linear-gradient(90deg,var(--book-paper),oklch(0.98_0.006_94)_60%,oklch(0.91_0.012_84))] opacity-70 shadow-[inset_1px_0_rgba(20,20,19,0.05)]" />
                    </div>
                </div>
                <CardContent className="p-0 pt-3">
                    <div className="min-w-0 border-l-2 border-primary/40 px-3 pb-1">
                        <h3
                            className={cn(
                                "line-clamp-2 text-sm leading-tight font-medium",
                                !coverUrl && "sr-only"
                            )}
                        >
                            {languages && (
                                <span className="font-mono text-[0.68rem] text-muted-foreground">
                                    [{languages}]
                                </span>
                            )}
                            <span className={languages ? "ml-1" : undefined}>
                                {book.title}
                            </span>
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs text-body-text">
                            {authorName}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
