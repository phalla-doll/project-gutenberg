import { BookCard } from "@/components/book-card-2"
import { Skeleton } from "@/components/ui/skeleton"
import type { Book } from "@/lib/gutendex"

interface BookGridProps {
    books: Book[]
}

export function BookGrid({ books }: BookGridProps) {
    return (
        <div className="grid grid-cols-2 gap-x-0 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {books.map((book, index) => (
                <BookCard key={book.id} book={book} priority={index < 6} />
            ))}
        </div>
    )
}

export function BookGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-x-0 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="shelf-cell flex flex-col">
                    <div className="shelf-wall flex justify-center px-2 pt-8">
                        <Skeleton className="aspect-2/3 w-[150px] rounded-sm" />
                    </div>
                    <div className="shelf-plank" aria-hidden="true" />
                    <div className="flex flex-col items-center gap-2 px-3 pt-4 pb-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )
}
