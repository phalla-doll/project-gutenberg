import { BookGridSkeleton } from "@/components/book-grid"
import { Skeleton } from "@/components/ui/skeleton"

export default function BrowseLoading() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="mt-3 h-6 w-96" />
            </div>
            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-20 rounded-md" />
                    ))}
                </div>
                <BookGridSkeleton />
            </div>
        </div>
    )
}
