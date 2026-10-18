import Link from "next/link"
import { ArrowUpRight01Icon } from "hugeicons-react"
import { BookJacket } from "@/components/book-jacket"
import { type Book, formatAuthorName } from "@/lib/gutendex"

interface BookCardProps {
    book: Book
    priority?: boolean
}

export function BookCard({ book, priority = false }: BookCardProps) {
    const author = book.authors[0]
    const authorName = author ? formatAuthorName(author) : "Unknown Author"

    return (
        <Link
            href={`/book/${book.id}`}
            className="catalog-book group"
            data-tone={book.id % 3}
            aria-label={`${book.title} by ${authorName}`}
            title={`${book.title} by ${authorName}`}
        >
            <div className="catalog-cover">
                <BookJacket book={book} priority={priority} />
                <span className="catalog-open" aria-hidden="true">
                    Open book
                    <ArrowUpRight01Icon className="size-3.5" />
                </span>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5 pt-4">
                <h2 className="line-clamp-2 min-h-11 text-base leading-snug font-medium group-hover:text-primary">
                    {book.title}
                </h2>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {authorName}
                </p>
            </div>
        </Link>
    )
}
