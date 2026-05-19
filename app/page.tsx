import { getPopularBooks } from "@/lib/gutendex-server"
import { HomeBookGrid } from "./home-book-grid"

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const data = await getPopularBooks(page)

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10">
                <h1 className="font-heading text-4xl tracking-tight text-balance md:text-5xl">
                    Popular Books
                </h1>
                <p className="mt-3 text-lg text-muted-foreground">
                    Discover the most downloaded picks from 75,000+ free books
                </p>
            </div>
            <HomeBookGrid key={page} initialData={data} currentPage={page} />
        </div>
    )
}
