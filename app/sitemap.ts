import { getPopularBooks, getReadableTextUrl } from "@/lib/gutendex"
import type { MetadataRoute } from "next"

const siteUrl = "https://gutenberg.manthaa.dev"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            changeFrequency: "hourly",
            priority: 1,
        },
        {
            url: `${siteUrl}/browse`,
            changeFrequency: "hourly",
            priority: 0.8,
        },
        {
            url: `${siteUrl}/search`,
            changeFrequency: "weekly",
            priority: 0.5,
        },
    ]

    const popularBooks = await getPopularBooks()
    const bookRoutes: MetadataRoute.Sitemap = popularBooks.results.flatMap(
        (book) => {
            const detailRoute: MetadataRoute.Sitemap[number] = {
                url: `${siteUrl}/book/${book.id}`,
                changeFrequency: "daily",
                priority: 0.7,
            }

            if (!getReadableTextUrl(book)) {
                return [detailRoute]
            }

            return [
                detailRoute,
                {
                    url: `${siteUrl}/book/${book.id}/read`,
                    changeFrequency: "daily",
                    priority: 0.6,
                },
            ]
        }
    )

    return [...staticRoutes, ...bookRoutes]
}
