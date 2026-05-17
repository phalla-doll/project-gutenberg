import { getPopularBooks } from "@/lib/gutendex"
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
                    Popular Books
                </h1>
                <p className="mt-2 text-muted-foreground">
                    The most downloaded free books from Project Gutenberg
                </p>
            </div>
            <HomeBookGrid initialData={data} currentPage={page} />
        </div>
    )
}
