import { Suspense } from "react"
import { BrowseContent } from "./browse-content"
import { BookGridSkeleton } from "@/components/book-grid"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Browse - Project Gutenberg",
    description:
        "Browse free ebooks by topic and category from Project Gutenberg",
}

const TOPICS = [
    { slug: "fiction", label: "Fiction" },
    { slug: "science fiction", label: "Science Fiction" },
    { slug: "fantasy", label: "Fantasy" },
    { slug: "mystery", label: "Mystery & Detective" },
    { slug: "romance", label: "Romance" },
    { slug: "adventure", label: "Adventure" },
    { slug: "history", label: "History" },
    { slug: "philosophy", label: "Philosophy" },
    { slug: "science", label: "Science" },
    { slug: "poetry", label: "Poetry" },
    { slug: "children", label: "Children's Literature" },
    { slug: "horror", label: "Horror" },
    { slug: "detective", label: "Detective" },
    { slug: "short stories", label: "Short Stories" },
    { slug: "drama", label: "Drama" },
    { slug: "biography", label: "Biography" },
    { slug: "psychology", label: "Psychology" },
    { slug: "religion", label: "Religion" },
    { slug: "music", label: "Music" },
    { slug: "war", label: "War" },
]

export default async function BrowsePage({
    searchParams,
}: {
    searchParams: Promise<{ topic?: string; page?: string }>
}) {
    const params = await searchParams
    const topic = params.topic || "fiction"
    const page = Number(params.page) || 1

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
                    Browse by Topic
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Explore free ebooks organized by subject and category
                </p>
            </div>
            <Suspense fallback={<BookGridSkeleton />}>
                <BrowseContent
                    topics={TOPICS}
                    activeTopic={topic}
                    currentPage={page}
                />
            </Suspense>
        </div>
    )
}
