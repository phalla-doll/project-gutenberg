import { config } from "dotenv"
config({ path: ".env.local" })
import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.DATABASE_URL!)
const rows = await sql`
  SELECT id, title, jsonb_array_length(authors) as n_authors,
         array_length(subjects,1) as n_subjects,
         array_length(languages,1) as n_langs,
         download_count,
         (search_tsv IS NOT NULL) as has_tsv
  FROM books ORDER BY download_count DESC LIMIT 5
`
console.log(rows)
const [{ count }] = await sql`SELECT count(*)::int as count FROM books`
console.log("total:", count)
