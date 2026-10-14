import { BookCard } from "@/components/book-card-2"
import { Skeleton } from "@/components/ui/skeleton"
import type { Book } from "@/lib/gutendex"

interface BookGridProps {
    books: Book[]
}

export function BookGrid({ books }: BookGridProps) {
    return (
        <div className="bookcase">
            <div className="bookcase-inner grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {books.map((book, index) => (
                    <BookCard key={book.id} book={book} priority={index < 6} />
                ))}
            </div>
        </div>
    )
}

export function BookGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="bookcase">
            <div className="bookcase-inner grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="shelf-cell">
                        <div className="flex h-(--shelf-bay) items-end justify-center">
                            <Skeleton className="aspect-2/3 w-[150px] rounded-sm" />
                        </div>
                        <div className="shelf-label items-center gap-1.5">
                            <Skeleton className="h-2 w-12" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
