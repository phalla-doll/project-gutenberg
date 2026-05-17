import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Download04Icon,
    GlobeIcon,
    File01Icon,
    SmartPhone01Icon,
} from "hugeicons-react"
import type { Book } from "@/lib/gutendex"
import { getFormatLabel } from "@/lib/gutendex"

function getFormatIcon(mimeType: string) {
    if (mimeType.includes("epub")) return SmartPhone01Icon
    if (mimeType.includes("html")) return GlobeIcon
    if (mimeType.includes("text")) return File01Icon
    return Download04Icon
}

const PRIORITY_FORMATS = [
    "text/html",
    "application/epub+zip",
    "text/plain; charset=utf-8",
    "text/plain; charset=us-ascii",
    "application/x-mobipocket-ebook",
]

interface DownloadLinksProps {
    book: Book
}

export function DownloadLinks({ book }: DownloadLinksProps) {
    const formats = Object.entries(book.formats)
        .filter(
            ([mime]) =>
                !mime.startsWith("image/") && mime !== "application/rdf+xml"
        )
        .sort((a, b) => {
            const aIdx = PRIORITY_FORMATS.findIndex((f) =>
                a[0].includes(f.replace(/;.*$/, ""))
            )
            const bIdx = PRIORITY_FORMATS.findIndex((f) =>
                b[0].includes(f.replace(/;.*$/, ""))
            )
            return aIdx - bIdx
        })

    return (
        <div className="flex flex-col gap-3">
            <h3 className="font-heading text-lg">Download</h3>
            <Separator />
            <div className="flex flex-wrap gap-2">
                {formats.map(([mimeType, url], index) => {
                    const Icon = getFormatIcon(mimeType)
                    const label = mimeType.startsWith("text/html")
                        ? "Read official page"
                        : getFormatLabel(mimeType)
                    return (
                        <Button
                            key={mimeType}
                            variant={index === 0 ? "default" : "outline"}
                            size="sm"
                            className={
                                index === 0
                                    ? undefined
                                    : "border-on-dark/75 text-on-dark hover:border-on-dark hover:!bg-on-dark/5 hover:!text-on-dark"
                            }
                            asChild
                        >
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Icon className="size-4" />
                                {label}
                            </a>
                        </Button>
                    )
                })}
            </div>
        </div>
    )
}
