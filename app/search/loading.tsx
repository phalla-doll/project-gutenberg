import { BookGridSkeleton } from "@/components/book-grid"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10">
                <Skeleton className="h-12 w-56" />
                <Skeleton className="mt-3 h-6 w-80" />
            </div>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-1.5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-8 w-20 rounded-md"
                                />
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-8 w-24 rounded-md"
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <BookGridSkeleton />
            </div>
        </div>
    )
}
