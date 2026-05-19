import { config } from "dotenv"
config({ path: ".env.local" })

import { neonConfig, Pool } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!url) throw new Error("DATABASE_URL not set")

const pool = new Pool({ connectionString: url })

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

async function fetchPage(pageUrl: string, retries = 4): Promise<Page> {
    let lastErr: unknown
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(pageUrl, {
                signal: AbortSignal.timeout(180000),
            })
            if (res.ok) return res.json()
            if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                throw new Error(`HTTP ${res.status} on ${pageUrl}`)
            }
            lastErr = new Error(`HTTP ${res.status}`)
        } catch (e) {
            lastErr = e
        }
        const delay = 800 * 2 ** i + Math.random() * 400
        console.warn(
            `  retry ${i + 1}/${retries} after ${Math.round(delay)}ms: ${(lastErr as Error).message}`
        )
        await new Promise((r) => setTimeout(r, delay))
    }
    throw lastErr
}

async function upsertBatch(batch: GutendexBook[]) {
    if (batch.length === 0) return 0
    const cols = [
        "id",
        "title",
        "authors",
        "translators",
        "subjects",
        "bookshelves",
        "languages",
        "summaries",
        "copyright",
        "media_type",
        "formats",
        "download_count",
        "synced_at",
    ]
    const values: unknown[] = []
    const rows: string[] = []
    let p = 1
    for (const b of batch) {
        rows.push(
            `($${p++},$${p++},$${p++}::jsonb,$${p++}::jsonb,$${p++}::text[],$${p++}::text[],$${p++}::text[],$${p++}::text[],$${p++},$${p++},$${p++}::jsonb,$${p++},now())`
        )
        values.push(
            b.id,
            b.title,
            JSON.stringify(b.authors ?? []),
            JSON.stringify(b.translators ?? []),
            b.subjects ?? [],
            b.bookshelves ?? [],
            b.languages ?? [],
            b.summaries ?? [],
            b.copyright,
            b.media_type,
            JSON.stringify(b.formats ?? {}),
            b.download_count ?? 0
        )
    }
    const sqlText = `
        INSERT INTO books (${cols.join(",")})
        VALUES ${rows.join(",")}
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
    const client = await pool.connect()
    try {
        const result = await client.query(sqlText, values)
        return result.rowCount ?? 0
    } finally {
        client.release()
    }
}

async function run() {
    const startPage = Number(process.env.START_PAGE || 1)
    const maxPages = Number(process.env.MAX_PAGES || Infinity)
    const sortMode = process.env.SORT || "popular" // 'popular' or 'ascending' for full scan
    const sleepMs = Number(process.env.SLEEP_MS || 250)

    const client = await pool.connect()
    let runId: number
    try {
        const r = await client.query(
            "INSERT INTO sync_runs (kind) VALUES ($1) RETURNING id",
            [process.env.KIND || "backfill"]
        )
        runId = r.rows[0].id
    } finally {
        client.release()
    }
    console.log(`sync run #${runId} started (sort=${sortMode})`)

    let nextUrl: string | null =
        `https://gutendex.com/books?sort=${sortMode}&page=${startPage}`
    let pagesDone = 0
    let totalUpserts = 0
    const startedAt = Date.now()

    try {
        while (nextUrl && pagesDone < maxPages) {
            const t0 = Date.now()
            const page = await fetchPage(nextUrl)
            const upserts = await upsertBatch(page.results)
            pagesDone++
            totalUpserts += upserts
            const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0)
            const pageTime = Date.now() - t0
            console.log(
                `[${elapsed}s] page ${startPage + pagesDone - 1}: ${page.results.length} books, ${upserts} upserts, ${pageTime}ms (total ${totalUpserts})`
            )
            if (pagesDone % 10 === 0) {
                await pool.query(
                    "UPDATE sync_runs SET pages_done=$1, rows_upsert=$2 WHERE id=$3",
                    [pagesDone, totalUpserts, runId]
                )
            }
            nextUrl = page.next
            if (nextUrl) await new Promise((r) => setTimeout(r, sleepMs))
        }
        await pool.query(
            "UPDATE sync_runs SET pages_done=$1, rows_upsert=$2, ended_at=now() WHERE id=$3",
            [pagesDone, totalUpserts, runId]
        )
        console.log(
            `done: ${pagesDone} pages, ${totalUpserts} upserts in ${((Date.now() - startedAt) / 1000).toFixed(0)}s`
        )
    } catch (e) {
        const msg = (e as Error).message
        await pool.query(
            "UPDATE sync_runs SET pages_done=$1, rows_upsert=$2, ended_at=now(), error=$3 WHERE id=$4",
            [pagesDone, totalUpserts, msg, runId]
        )
        throw e
    }
}

try {
    await run()
} finally {
    await pool.end()
}
