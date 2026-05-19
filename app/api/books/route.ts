import { NextRequest, NextResponse } from "next/server"
import {
    getBooksByTopic,
    getPopularBooks,
    searchBooks,
} from "@/lib/gutendex-server"
import type { BrowseSort } from "@/lib/gutendex"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams
    const mode = sp.get("mode") || "popular"
    const page = Number(sp.get("page") || "1")

    try {
        if (mode === "popular") {
            return NextResponse.json(await getPopularBooks(page))
        }
        if (mode === "topic") {
            const topic = sp.get("topic") || ""
            const sort = (sp.get("sort") as BrowseSort) || "popular"
            return NextResponse.json(await getBooksByTopic(topic, page, sort))
        }
        if (mode === "search") {
            const languages = sp.get("languages")
            const ays = sp.get("author_year_start")
            const aye = sp.get("author_year_end")
            return NextResponse.json(
                await searchBooks({
                    page,
                    search: sp.get("search") || undefined,
                    topic: sp.get("topic") || undefined,
                    languages: languages ? languages.split(",") : undefined,
                    author_year_start: ays ? Number(ays) : undefined,
                    author_year_end: aye ? Number(aye) : undefined,
                    sort:
                        (sp.get("sort") as
                            | "popular"
                            | "ascending"
                            | "descending") || undefined,
                })
            )
        }
        return NextResponse.json({ error: "invalid mode" }, { status: 400 })
    } catch (e) {
        return NextResponse.json(
            { error: (e as Error).message },
            { status: 500 }
        )
    }
}
