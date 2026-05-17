import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen01Icon } from "hugeicons-react"
import { type Book, getCoverUrl, formatAuthorName } from "@/lib/gutendex"

interface BookCardProps {
    book: Book
}

export function BookCard({ book }: BookCardProps) {
    const coverUrl = getCoverUrl(book)
    const author = book.authors[0]
    const authorName = author ? formatAuthorName(author) : "Unknown Author"

    return (
        <Link href={`/book/${book.id}`}>
            <Card className="group h-full gap-0 overflow-hidden rounded-xl py-0 transition-shadow hover:shadow-[0_1px_3px_rgba(20,20,19,0.08)]">
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
                </div>
                <CardContent className="border-t border-border/60 p-0">
                    <div className="min-w-0 border-l-2 border-primary/40 px-3 pt-3 pb-2">
                        <h3 className="line-clamp-2 text-sm leading-tight font-medium">
                            [
                            {book.languages.slice(0, 2).map((lang) => (
                                <span key={lang}>{lang.toUpperCase()}</span>
                            ))}
                            ]<span className="ml-1">{book.title}</span>
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
