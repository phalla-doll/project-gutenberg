import { SearchResults } from "./search-results"
import { searchBooks } from "@/lib/gutendex-server"
import { defaultOgImage, siteName } from "@/lib/site-metadata"
import type { Metadata } from "next"
import { PageHeading } from "@/components/page-heading"

export const metadata: Metadata = {
    title: "Search",
    description: "Search through thousands of free ebooks with Project Sonam",
    alternates: {
        canonical: "/search",
    },
    openGraph: {
        title: `Search - ${siteName}`,
        description:
            "Search through thousands of free ebooks with Project Sonam",
        url: "/search",
        siteName,
        locale: "en_US",
        type: "website",
        images: [defaultOgImage],
    },
    twitter: {
        card: "summary_large_image",
        title: `Search - ${siteName}`,
        description:
            "Search through thousands of free ebooks with Project Sonam",
        images: [defaultOgImage.url],
    },
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{
        q?: string
        topic?: string
        lang?: string
    }>
}) {
    const params = await searchParams
    const query = params.q || ""
    const topic = params.topic || ""
    const lang = params.lang || ""

    const hasSearch = !!(query || topic)

    const initialData = hasSearch
        ? await searchBooks({
              search: query || undefined,
              topic: topic || undefined,
              languages: lang ? [lang] : undefined,
              page: 1,
          })
        : undefined

    const initialKey = hasSearch ? `${query}|${topic}|${lang}|1` : undefined

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <PageHeading
                title="Search Books"
                description="Find your next great read from over 75,000 free ebooks"
            />
            <SearchResults
                query={query}
                topic={topic}
                lang={lang}
                initialData={initialData}
                initialKey={initialKey}
            />
        </div>
    )
}
