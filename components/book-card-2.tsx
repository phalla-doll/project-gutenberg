"use client"

import React from "react"
import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { useResponsive } from "@/components/ui/use-responsive"
import {
    type Book as GutendexBook,
    formatAuthorName,
    getCoverUrl,
} from "@/lib/gutendex"

const DefaultIllustration = (
    <svg
        fill="none"
        height="56"
        viewBox="0 0 36 56"
        width="36"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            clipRule="evenodd"
            d="M3.03113 28.0005C6.26017 23.1765 11.7592 20.0005 18 20.0005C24.2409 20.0005 29.7399 23.1765 32.9689 28.0005C29.7399 32.8244 24.2409 36.0005 18 36.0005C11.7592 36.0005 6.26017 32.8244 3.03113 28.0005Z"
            fill="#0070F3"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M32.9691 28.0012C34.8835 25.1411 36 21.7017 36 18.0015C36 8.06034 27.9411 0.00146484 18 0.00146484C8.05887 0.00146484 0 8.06034 0 18.0015C0 21.7017 1.11648 25.1411 3.03094 28.0012C6.25996 23.1771 11.7591 20.001 18 20.001C24.2409 20.001 29.74 23.1771 32.9691 28.0012Z"
            fill="#45DEC4"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M32.9692 28.0005C29.7402 32.8247 24.241 36.001 18 36.001C11.759 36.001 6.25977 32.8247 3.03077 28.0005C1.11642 30.8606 0 34.2999 0 38C0 47.9411 8.05887 56 18 56C27.9411 56 36 47.9411 36 38C36 34.2999 34.8836 30.8606 32.9692 28.0005Z"
            fill="#E5484D"
            fillRule="evenodd"
        />
    </svg>
)

interface ResponsiveProp<T> {
    sm?: T
    md?: T
    lg?: T
    xl?: T
}

interface BookProps {
    title: string
    variant?: "simple" | "stripe"
    width?: number | ResponsiveProp<number>
    color?: string
    textColor?: string
    illustration?: React.ReactNode
    textured?: boolean
    coverUrl?: string | null
    coverAlt?: string
    priority?: boolean
}

interface BookCardProps {
    book: GutendexBook
    priority?: boolean
}

const coverThemes = [
    {
        cover: "oklch(0.658 0.113 39.1)",
        text: "oklch(0.191 0.002 106.6)",
    },
    {
        cover: "oklch(0.552 0.113 38.5)",
        text: "oklch(0.191 0.002 106.6)",
    },
    {
        cover: "oklch(0.257 0.006 78.2)",
        text: "oklch(0.982 0.005 95.1)",
    },
    {
        cover: "oklch(0.708 0.134 149.4)",
        text: "oklch(0.191 0.002 106.6)",
    },
]

export const Book = ({
    title,
    variant = "stripe",
    width = 196,
    color,
    textColor = "var(--ds-gray-1000)",
    illustration,
    textured = false,
    coverUrl,
    coverAlt = "",
    priority = false,
}: BookProps) => {
    const _width = useResponsive(width) ?? 196
    const _color = color
        ? color
        : variant === "simple"
          ? "var(--ds-background-200)"
          : "var(--ds-amber-600)"
    const _illustration = illustration ? illustration : DefaultIllustration
    const _perspective = (_width / 196) * 900

    return (
        <div
            className="inline-block w-fit"
            style={{ perspective: _perspective }}
        >
            <div
                className="book-rotate relative aspect-[49/60] w-fit rotate-0 duration-[250ms]"
                style={{
                    transformStyle: "preserve-3d",
                    minWidth: _width,
                    containerType: "inline-size",
                }}
            >
                <div
                    className="relative flex h-full translate-x-0 flex-col overflow-hidden rounded-l-md rounded-r bg-background-200 shadow-book after:absolute after:inset-0 after:rounded-l-md after:rounded-r after:border after:border-gray-alpha-400 after:shadow-book-border"
                    style={{ width: _width }}
                >
                    {coverUrl ? (
                        <div className="relative size-full overflow-hidden bg-background-200">
                            <Image
                                src={coverUrl}
                                alt=""
                                fill
                                aria-hidden="true"
                                className="scale-[1.12] object-cover opacity-[0.22] blur-md saturate-75"
                                sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 196px"
                                priority={priority}
                            />
                            <div className="absolute inset-0 bg-background-200/45" />
                            <div className="absolute inset-y-[2.2%] right-[3.4%] left-[9.8%] overflow-hidden rounded-[2px] shadow-[0_1px_1px_rgba(20,20,19,0.2),0_0_0_1px_rgba(255,255,255,0.36)]">
                                <Image
                                    src={coverUrl}
                                    alt={coverAlt}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 196px"
                                    priority={priority}
                                />
                            </div>
                            <div className="pointer-events-none absolute inset-y-[2.2%] right-[3.4%] left-[9.8%] rounded-[2px] bg-[linear-gradient(90deg,rgba(255,255,255,0.12),transparent_16%,transparent_78%,rgba(20,20,19,0.08)),linear-gradient(180deg,rgba(255,255,255,0.2),transparent_14%,transparent_82%,rgba(20,20,19,0.12))]" />
                        </div>
                    ) : (
                        <>
                            <div
                                className={clsx(
                                    "relative w-full overflow-hidden",
                                    variant === "stripe" && "flex-1"
                                )}
                                style={{ background: _color }}
                            >
                                {variant === "stripe" ? (
                                    <div className="absolute h-full w-full">
                                        {_illustration}
                                    </div>
                                ) : null}
                                <div
                                    className="absolute h-full w-[8.2%] mix-blend-overlay"
                                    style={{
                                        background: "var(--ds-book-bind)",
                                    }}
                                />
                            </div>
                            <div
                                className={clsx(
                                    "relative flex-1",
                                    (variant === "stripe" ||
                                        (variant === "simple" &&
                                            color === undefined)) &&
                                        "bg-book-gradient"
                                )}
                                style={{
                                    background:
                                        variant === "simple" &&
                                        color !== undefined
                                            ? _color
                                            : undefined,
                                }}
                            >
                                <div
                                    className="absolute h-full w-[8.2%] opacity-20"
                                    style={{
                                        background: "var(--ds-book-bind)",
                                    }}
                                />
                                <div
                                    className={clsx(
                                        "flex w-full flex-col p-[6.1%] pl-[14.3%]",
                                        variant === "simple"
                                            ? "gap-4"
                                            : "justify-between"
                                    )}
                                    style={{
                                        containerType: "inline-size",
                                        gap: `calc((24px / 196) * ${_width})`,
                                    }}
                                >
                                    <span
                                        className={clsx(
                                            "leading-[1.25em] font-semibold tracking-[-.02em] text-balance",
                                            variant === "simple"
                                                ? "text-[12cqw]"
                                                : "text-[10.5cqw]"
                                        )}
                                        style={{ color: textColor }}
                                    >
                                        {title}
                                    </span>
                                    {variant === "stripe" ? (
                                        <svg
                                            className="-mb-1 -ml-1 scale-75"
                                            height="24"
                                            width="24"
                                            style={{ fill: textColor }}
                                        >
                                            <path d="M21,21H3L12,3Z" />
                                        </svg>
                                    ) : (
                                        _illustration
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-[8.4%]"
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(255,255,255,0.96), rgba(255,255,255,0.76) 34%, rgba(20,20,19,0.085) 78%, rgba(255,255,255,0.16))",
                        }}
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-[3.2%] w-px bg-white/70" />
                    <div className="pointer-events-none absolute inset-y-0 left-[8.2%] w-px bg-foreground/20" />
                    <div className="pointer-events-none absolute inset-y-0 left-[8.8%] w-[4.6%] bg-[linear-gradient(90deg,rgba(20,20,19,0.1),rgba(255,255,255,0.14)_42%,transparent)] mix-blend-multiply" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-[2.4%] bg-[linear-gradient(270deg,rgba(20,20,19,0.1),transparent)] mix-blend-multiply" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[6.5%] bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent)] mix-blend-screen" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[8.5%] bg-[linear-gradient(0deg,rgba(20,20,19,0.1),transparent)] mix-blend-multiply" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(108deg,transparent_0%,rgba(255,255,255,0.12)_30%,transparent_43%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {textured ? (
                        <div
                            className={clsx(
                                "pointer-events-none absolute inset-0 top-0 left-0 rotate-180 rounded-l-md rounded-r bg-[url('https://assets.vercel.com/image/upload/v1720554484/front/design/book-texture.avif')] bg-cover bg-no-repeat mix-blend-hard-light brightness-110",
                                coverUrl ? "opacity-28" : "opacity-50"
                            )}
                        />
                    ) : null}
                </div>

                <div
                    className="absolute top-[3px] h-[calc(100%_-_2_*_3px)] w-[calc(29cqw_-_2px)]"
                    style={{
                        background:
                            "repeating-linear-gradient(180deg, rgba(20,20,19,0.08) 0 1px, transparent 1px 4px), linear-gradient(90deg, #e8e1d1, #fffdf6 38%, #ddd3bd 100%)",
                        transform: `translateX(calc(${_width} * 1px - 29cqw / 2 - 3px)) rotateY(90deg) translateX(calc(29cqw / 2))`,
                    }}
                />
                <div
                    className="absolute top-0 left-0 h-full rounded-l-md rounded-r bg-gray-200"
                    style={{
                        background:
                            "linear-gradient(90deg, rgba(20,20,19,0.08), transparent 14%), linear-gradient(180deg, #eee8db, #d7cdb9)",
                        width: _width,
                        transform: "translateZ(calc(-1 * 29cqw))",
                    }}
                />
            </div>
        </div>
    )
}

export function BookCard({ book, priority = false }: BookCardProps) {
    const coverUrl = getCoverUrl(book)
    const author = book.authors[0]
    const authorName = author ? formatAuthorName(author) : "Unknown Author"
    const theme = coverThemes[book.id % coverThemes.length]
    const languages = book.languages.slice(0, 2).join(" / ").toUpperCase()

    return (
        <Link href={`/book/${book.id}`} className="block h-full">
            <Card className="group h-full gap-0 overflow-visible rounded-md bg-transparent py-0 shadow-none ring-0">
                <div className="mx-auto w-full max-w-[196px] pt-1">
                    <Book
                        title={book.title}
                        color={theme.cover}
                        textColor={theme.text}
                        coverUrl={coverUrl}
                        coverAlt={book.title}
                        textured
                        priority={priority}
                    />
                </div>
                <CardContent className="p-0 pt-3">
                    <div className="min-w-0 border-l-2 border-primary/40 px-3 pb-1">
                        <h3 className="line-clamp-2 text-sm leading-tight font-medium">
                            {languages ? (
                                <span className="font-mono text-[0.68rem] text-muted-foreground">
                                    [{languages}]
                                </span>
                            ) : null}
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
