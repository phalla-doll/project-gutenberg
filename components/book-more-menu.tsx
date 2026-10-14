"use client"

import { getDownloadFormats } from "@/components/download-links"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import type { Book } from "@/lib/gutendex"
import {
    ArrowUpRight03Icon,
    BookOpen01Icon,
    MoreHorizontalIcon,
} from "hugeicons-react"

const itemClass =
    "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted"

export function BookMoreMenu({ book }: { book: Book }) {
    const formats = getDownloadFormats(book)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="secondary" className="w-full">
                    <MoreHorizontalIcon className="size-4" aria-hidden="true" />
                    More
                </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-64 p-1.5">
                {formats.length > 0 ? (
                    <>
                        <p className="px-2.5 pt-2 pb-1 font-mono text-[0.68rem] tracking-wider text-muted-foreground uppercase">
                            Download
                        </p>
                        <ul>
                            {formats.map(({ mimeType, url, Icon, label }) => (
                                <li key={mimeType}>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={itemClass}
                                    >
                                        <Icon
                                            className="size-4 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div
                            className="my-1.5 h-px bg-border"
                            role="separator"
                        />
                    </>
                ) : null}
                <a href={`/book/${book.id}`} className={itemClass}>
                    <BookOpen01Icon
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                    Open full page
                    <ArrowUpRight03Icon
                        className="ml-auto size-3.5 text-muted-foreground"
                        aria-hidden="true"
                    />
                </a>
            </PopoverContent>
        </Popover>
    )
}
