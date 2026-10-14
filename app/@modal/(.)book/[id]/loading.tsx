import { BookDialog } from "@/components/book-dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function BookModalLoading() {
    return (
        <BookDialog title="Loading book">
            <div className="md:grid md:h-full md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                <div className="flex flex-col items-center justify-center gap-4 px-6 pt-10 pb-6">
                    <Skeleton className="aspect-2/3 w-[220px] rounded-sm" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-9 w-full max-w-[280px]" />
                </div>
                <div className="flex flex-col gap-4 px-6 pb-8 md:py-12 md:pr-12 md:pl-4">
                    <Skeleton className="h-10 w-4/5" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="mt-4 h-24 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </BookDialog>
    )
}
