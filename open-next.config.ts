import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache"

// R2 backs the Next.js incremental cache (ISR + `fetch` revalidate, e.g. the
// 24h cache on /book/[id]/read and statically generated /bookshelves/[slug]).
export default defineCloudflareConfig({
    incrementalCache: r2IncrementalCache,
})
