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

    return (
        <div
            className="book-scene inline-block w-fit"
            style={
                {
                    "--book-width": `${_width}px`,
                    "--book-color": _color,
                } as React.CSSProperties
            }
        >
            <div
                className="book-rotate relative aspect-[2/3] w-fit"
                style={{ minWidth: _width, containerType: "inline-size" }}
            >
                <div
                    className="book-cover relative flex h-full flex-col overflow-hidden bg-background-200 shadow-book"
                    style={{ width: _width, transform: "translateZ(0)" }}
                >
                    {coverUrl ? (
                        <Image
                            src={coverUrl}
                            alt={coverAlt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 196px"
                            priority={priority}
                        />
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
                    {textured ? (
                        <div className="book-cover pointer-events-none absolute inset-0 rotate-180 bg-[url('https://assets.vercel.com/image/upload/v1720554484/front/design/book-texture.avif')] bg-cover bg-no-repeat opacity-35 mix-blend-soft-light" />
                    ) : null}
                    <div className="book-hinge pointer-events-none absolute inset-0" />
                    <div className="book-sheen book-cover pointer-events-none absolute inset-0" />
                </div>
                <div className="book-pages" aria-hidden="true" />
                <div className="book-back" aria-hidden="true">
                    {coverUrl ? (
                        <Image
                            src={coverUrl}
                            alt=""
                            fill
                            className="scale-x-[-1] object-cover blur-[2px]"
                            sizes="196px"
                        />
                    ) : null}
                </div>
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
                        <p className="line-clamp-2 text-sm leading-tight font-medium">
                            {languages ? (
                                <span className="font-mono text-[0.68rem] text-muted-foreground">
                                    [{languages}]
                                </span>
                            ) : null}
                            <span className={languages ? "ml-1" : undefined}>
                                {book.title}
                            </span>
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-body-text">
                            {authorName}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
