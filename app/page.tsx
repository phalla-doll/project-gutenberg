import { Suspense } from "react"
import { getCoverUrl } from "@/lib/gutendex"
import { getPopularBooks } from "@/lib/gutendex-server"
import { BookGridSkeleton } from "@/components/book-grid"
import { HomeBookGrid } from "./home-book-grid"
import { PageHeading } from "@/components/page-heading"

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <PageHeading
                mark="01"
                markLabel="Most read"
                title="Popular Books"
                description="Discover the most downloaded picks from 75,000+ free books"
            />
            <Suspense key={page} fallback={<BookGridSkeleton />}>
                <HomeBooks page={page} />
            </Suspense>
        </div>
    )
}

async function HomeBooks({ page }: { page: number }) {
    const data = await getPopularBooks(page)
    const lcpImage =
        data.results.length > 0 ? getCoverUrl(data.results[0]) : null

    return (
        <>
            {lcpImage && (
                <link
                    rel="preload"
                    as="image"
                    href={lcpImage}
                    fetchPriority="high"
                />
            )}
            <HomeBookGrid key={page} initialData={data} currentPage={page} />
        </>
    )
}
