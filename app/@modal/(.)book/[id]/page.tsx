import { notFound } from "next/navigation"
import { BookDetail } from "@/components/book-detail"
import { BookDialog } from "@/components/book-dialog"
import { getBookById } from "@/lib/gutendex-server"

export default async function BookModal({
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
        <BookDialog title={book.title}>
            <BookDetail book={book} variant="dialog" />
        </BookDialog>
    )
}
