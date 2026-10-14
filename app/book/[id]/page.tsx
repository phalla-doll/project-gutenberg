import { cache } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BookDetail } from "@/components/book-detail"
import { Button } from "@/components/ui/button"
import { BookChatAssistant } from "@/components/book-chat-assistant"
import { getBookById as _getBookById } from "@/lib/gutendex-server"
import { getCoverUrl, formatAuthorName } from "@/lib/gutendex"
import { defaultOgImage, siteName } from "@/lib/site-metadata"
import { ArrowLeft01Icon } from "hugeicons-react"
import type { Metadata } from "next"

const getBookById = cache(_getBookById)

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    try {
        const book = await getBookById(Number(id))
        const description =
            book.summaries[0] || `Read ${book.title} for free on Project Sonam`
        const authorNames = book.authors.map(formatAuthorName)
        const title = `${book.title} - ${siteName}`
        const url = `/book/${book.id}`
        const coverUrl = getCoverUrl(book)
        const ogImage = coverUrl
            ? { url: coverUrl, alt: book.title }
            : defaultOgImage

        return {
            title: book.title,
            description,
            authors: authorNames.length
                ? authorNames.map((name) => ({ name }))
                : [{ name: siteName }],
            creator: authorNames[0] || siteName,
            publisher: siteName,
            alternates: {
                canonical: url,
            },
            openGraph: {
                title,
                description,
                url,
                siteName,
                locale: "en_US",
                type: "book",
                authors: authorNames.length ? authorNames : undefined,
                tags: book.subjects.slice(0, 8),
                images: [ogImage],
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [ogImage.url],
            },
        }
    } catch {
        return { title: "Book" }
    }
}

export default async function BookDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    let book
    try {
        book = await getBookById(Number(id))
    } catch {
        notFound()
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Link href="/">
                <Button variant="link" size="sm" className="mb-8 gap-2 px-0">
                    <ArrowLeft01Icon className="size-4" aria-hidden="true" />
                    Back to books
                </Button>
            </Link>

            <BookDetail book={book} />

            <BookChatAssistant bookId={book.id} title={book.title} />
        </div>
    )
}
