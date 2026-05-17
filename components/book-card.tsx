import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen01Icon, ArrowDown01Icon } from "hugeicons-react"
import {
    type Book,
    getCoverUrl,
    formatAuthorName,
    formatDownloadCount,
} from "@/lib/gutendex"

interface BookCardProps {
    book: Book
}

export function BookCard({ book }: BookCardProps) {
    const coverUrl = getCoverUrl(book)
    const author = book.authors[0]
    const authorName = author ? formatAuthorName(author) : "Unknown Author"

    return (
        <Link href={`/book/${book.id}`}>
            <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
                <div className="relative aspect-2/3 overflow-hidden bg-muted">
                    {coverUrl ? (
                        <Image
                            src={coverUrl}
                            alt={book.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center">
                            <BookOpen01Icon
                                className="size-16 text-muted-foreground/40"
                                aria-hidden="true"
                            />
                        </div>
                    )}
                    <div className="absolute right-2 bottom-2">
                        <Badge variant="secondary" className="gap-1 text-xs">
                            <ArrowDown01Icon
                                className="size-3"
                                aria-hidden="true"
                            />
                            {formatDownloadCount(book.download_count)}
                        </Badge>
                    </div>
                </div>
                <CardContent className="border-t border-border/60 p-0">
                    <div className="min-w-0 border-l-2 border-primary/40 px-3 pt-3 pb-2">
                        <h3 className="line-clamp-2 font-heading text-sm leading-tight font-semibold">
                            {book.title}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {authorName}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-1 border-t border-border/40 px-3 py-2">
                    {book.languages.slice(0, 2).map((lang) => (
                        <Badge
                            key={lang}
                            variant="outline"
                            className="text-[10px]"
                        >
                            {lang.toUpperCase()}
                        </Badge>
                    ))}
                </CardFooter>
            </Card>
        </Link>
    )
}
