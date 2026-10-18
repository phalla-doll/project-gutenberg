import { BookCard } from "@/components/book-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Book } from "@/lib/gutendex"

interface BookGridProps {
    books: Book[]
}

export function BookGrid({ books }: BookGridProps) {
    return (
        <div className="catalog-grid grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 xl:grid-cols-5">
            {books.map((book, index) => (
                <BookCard key={book.id} book={book} priority={index < 5} />
            ))}
        </div>
    )
}

export function BookGridSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div
            className="catalog-grid grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 xl:grid-cols-5"
            aria-label="Loading books"
            role="status"
        >
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="aspect-[4/5] w-full rounded-xl" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )
}
