import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/client"

export const maxDuration = 300
export const runtime = "nodejs"

interface Person {
    name: string
    birth_year: number | null
    death_year: number | null
}
interface GutendexBook {
    id: number
    title: string
    authors: Person[]
    translators: Person[]
    subjects: string[]
    bookshelves: string[]
    languages: string[]
    summaries: string[]
    copyright: boolean | null
    media_type: string
    formats: Record<string, string>
    download_count: number
}
interface Page {
    count: number
    next: string | null
    results: GutendexBook[]
}

function authorized(req: NextRequest): boolean {
    const auth = req.headers.get("authorization")
    const token = process.env.GUTENDEX_SYNC_TOKEN
    const cronSecret = process.env.CRON_SECRET
    if (token && auth === `Bearer ${token}`) return true
    if (cronSecret && auth === `Bearer ${cronSecret}`) return true
    return false
}

async function fetchPage(url: string, retries = 4): Promise<Page> {
    let lastErr: unknown
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, {
                signal: AbortSignal.timeout(60000),
            })
            if (res.ok) return res.json()
            if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                throw new Error(`HTTP ${res.status}`)
            }
            lastErr = new Error(`HTTP ${res.status}`)
        } catch (e) {
            lastErr = e
        }
        await new Promise((r) =>
            setTimeout(r, 500 * 2 ** i + Math.random() * 300)
        )
    }
    throw lastErr
}

async function upsert(batch: GutendexBook[]): Promise<number> {
    if (batch.length === 0) return 0
    let total = 0
    for (const b of batch) {
        await sql`
            INSERT INTO books (
                id, title, authors, translators, subjects, bookshelves,
                languages, summaries, copyright, media_type, formats,
                download_count, synced_at
            ) VALUES (
                ${b.id}, ${b.title},
                ${JSON.stringify(b.authors ?? [])}::jsonb,
                ${JSON.stringify(b.translators ?? [])}::jsonb,
                ${b.subjects ?? []}::text[],
                ${b.bookshelves ?? []}::text[],
                ${b.languages ?? []}::text[],
                ${b.summaries ?? []}::text[],
                ${b.copyright}, ${b.media_type},
                ${JSON.stringify(b.formats ?? {})}::jsonb,
                ${b.download_count ?? 0}, now()
            )
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                authors = EXCLUDED.authors,
                translators = EXCLUDED.translators,
                subjects = EXCLUDED.subjects,
                bookshelves = EXCLUDED.bookshelves,
                languages = EXCLUDED.languages,
                summaries = EXCLUDED.summaries,
                copyright = EXCLUDED.copyright,
                media_type = EXCLUDED.media_type,
                formats = EXCLUDED.formats,
                download_count = EXCLUDED.download_count,
                synced_at = now()
        `
        total++
    }
    return total
}

async function runSync(mode: "incremental" | "full") {
    const maxPages = mode === "incremental" ? 50 : 10000
    const [{ id: runId }] = (await sql`
        INSERT INTO sync_runs (kind) VALUES (${mode}) RETURNING id
    `) as { id: number }[]

    const deadline = Date.now() + 280_000 // leave 20s buffer before 300s timeout
    let pagesDone = 0
    let totalUpserts = 0
    let nextUrl: string | null =
        `https://gutendex.com/books?sort=popular&page=1`
    let lastError: string | null = null

    try {
        while (nextUrl && pagesDone < maxPages && Date.now() < deadline) {
            const page = await fetchPage(nextUrl)
            totalUpserts += await upsert(page.results)
            pagesDone++
            nextUrl = page.next
        }
    } catch (e) {
        lastError = (e as Error).message
    }

    await sql`
        UPDATE sync_runs
        SET pages_done = ${pagesDone},
            rows_upsert = ${totalUpserts},
            ended_at = now(),
            error = ${lastError}
        WHERE id = ${runId}
    `

    return { runId, pagesDone, totalUpserts, error: lastError }
}

export async function POST(req: NextRequest) {
    if (!authorized(req)) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
    const mode =
        (req.nextUrl.searchParams.get("mode") as "incremental" | "full") ||
        "incremental"
    if (mode !== "incremental" && mode !== "full") {
        return NextResponse.json({ error: "invalid mode" }, { status: 400 })
    }
    const result = await runSync(mode)
    return NextResponse.json(result)
}

export async function GET(req: NextRequest) {
    // Vercel Cron hits the path with GET by default
    return POST(req)
}
