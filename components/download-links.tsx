import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Download04Icon,
  GlobeIcon,
  File01Icon,
  SmartPhone01Icon,
} from "hugeicons-react"
import type { Book } from "@/lib/gutendex"

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
    .filter(([mime]) => !mime.startsWith("image/") && mime !== "application/rdf+xml")
    .sort((a, b) => {
      const aIdx = PRIORITY_FORMATS.findIndex((f) => a[0].includes(f.replace(/;.*$/, "")))
      const bIdx = PRIORITY_FORMATS.findIndex((f) => b[0].includes(f.replace(/;.*$/, "")))
      return aIdx - bIdx
    })

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-lg font-semibold">Download</h3>
      <Separator />
      <div className="flex flex-wrap gap-2">
        {formats.map(([mimeType, url]) => {
          const Icon = getFormatIcon(mimeType)
          const label = getFormatLabel(mimeType)
          return (
            <Button key={mimeType} variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
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

function getFormatLabel(mimeType: string): string {
  const labels: Record<string, string> = {
    "text/html": "Read Online",
    "text/plain; charset=utf-8": "Plain Text (UTF-8)",
    "text/plain; charset=us-ascii": "Plain Text",
    "application/epub+zip": "EPUB",
    "application/x-mobipocket-ebook": "Kindle",
    "application/octet-stream": "ZIP",
  }
  return labels[mimeType] || mimeType.split(";")[0].split("/")[1]?.toUpperCase() || mimeType
}
