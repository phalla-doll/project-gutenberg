import { BookCover } from "@/components/book-cover"
import { type Book, getCoverUrl } from "@/lib/gutendex"

interface BookJacketProps {
    book: Book
    priority?: boolean
}

export function BookJacket({ book, priority = false }: BookJacketProps) {
    const coverUrl = getCoverUrl(book)

    return (
        <div className="book-jacket" aria-hidden="true">
            <div className="book-jacket-pages" />
            <div className="book-jacket-face">
                <BookCover
                    key={coverUrl}
                    title={book.title}
                    coverUrl={coverUrl}
                    priority={priority}
                />
            </div>
        </div>
    )
}
