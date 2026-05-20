import { BookCard } from "@/components/book-card-2"
import { Skeleton } from "@/components/ui/skeleton"
import type { Book } from "@/lib/gutendex"

interface BookGridProps {
    books: Book[]
}

export function BookGrid({ books }: BookGridProps) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {books.map((book, index) => (
                <BookCard key={book.id} book={book} priority={index < 6} />
            ))}
        </div>
    )
}

export function BookGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="aspect-2/3 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))}
        </div>
    )
}
