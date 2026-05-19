import { config } from "dotenv"
config({ path: ".env.local" })

import {
    getPopularBooks,
    searchBooks,
    getBookById,
    getBooksByTopic,
} from "../lib/gutendex-server"

const pop = await getPopularBooks(1)
console.log("popular page 1:", pop.count, "total,", pop.results.length, "rows")
console.log(
    "  top 3:",
    pop.results.slice(0, 3).map((b) => b.title)
)

const search = await searchBooks({ search: "frankenstein" })
console.log("search 'frankenstein':", search.count, "total")
console.log("  first:", search.results[0]?.title)

const langSearch = await searchBooks({ languages: ["en"], page: 1 })
console.log("languages=[en]:", langSearch.count, "total")

const topic = await getBooksByTopic("Fiction", 1)
console.log("topic 'Fiction':", topic.count, "total")
console.log("  first:", topic.results[0]?.title)

const book = await getBookById(1342)
console.log("book 1342:", book.title, "/", book.authors[0]?.name)
console.log("  has cover:", !!book.formats["image/jpeg"])
console.log("  subjects:", book.subjects.slice(0, 3))
