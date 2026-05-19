import { config } from "dotenv"
config({ path: ".env.local" })

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { neonConfig, Pool } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!url) throw new Error("DATABASE_URL_UNPOOLED/DATABASE_URL not set")

const schema = readFileSync(resolve("lib/db/schema.sql"), "utf8")

const pool = new Pool({ connectionString: url })

try {
    const client = await pool.connect()
    try {
        await client.query(schema)
        console.log("schema applied")
    } finally {
        client.release()
    }
} finally {
    await pool.end()
}
