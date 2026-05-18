import { Suspense } from "react"
import { BrowseFilters } from "./browse-filters"
import { BrowseBookList } from "./browse-book-list"
import { BookGridSkeleton } from "@/components/book-grid"
import { getBooksByTopic, type BrowseSort } from "@/lib/gutendex"
import { defaultOgImage, siteName } from "@/lib/site-metadata"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Browse",
    description: "Browse free ebooks by topic and category with Project Sonam",
    alternates: {
        canonical: "/browse",
    },
    openGraph: {
        title: `Browse - ${siteName}`,
        description:
            "Browse free ebooks by topic and category with Project Sonam",
        url: "/browse",
        siteName,
        locale: "en_US",
        type: "website",
        images: [defaultOgImage],
    },
    twitter: {
        card: "summary_large_image",
        title: `Browse - ${siteName}`,
        description:
            "Browse free ebooks by topic and category with Project Sonam",
        images: [defaultOgImage.url],
    },
}

export const maxDuration = 180

export interface BrowseTopic {
    slug: string
    label: string
    query: string
}

export interface BrowseTopicGroup {
    heading: string
    topics: BrowseTopic[]
}

const TOPIC_GROUPS: BrowseTopicGroup[] = [
    {
        heading: "Literature",
        topics: [
            {
                slug: "adventure",
                label: "Adventure",
                query: "Category: Adventure",
            },
            {
                slug: "american-literature",
                label: "American Literature",
                query: "Category: American Literature",
            },
            {
                slug: "british-literature",
                label: "British Literature",
                query: "Category: British Literature",
            },
            {
                slug: "french-literature",
                label: "French Literature",
                query: "Category: French Literature",
            },
            {
                slug: "german-literature",
                label: "German Literature",
                query: "Category: German Literature",
            },
            {
                slug: "russian-literature",
                label: "Russian Literature",
                query: "Category: Russian Literature",
            },
            {
                slug: "classics",
                label: "Classics",
                query: "Category: Classics of Literature",
            },
            {
                slug: "biographies",
                label: "Biographies",
                query: "Category: Biographies",
            },
            { slug: "novels", label: "Novels", query: "Category: Novels" },
            {
                slug: "short-stories",
                label: "Short Stories",
                query: "Category: Short Stories",
            },
            { slug: "poetry", label: "Poetry", query: "Category: Poetry" },
            {
                slug: "plays",
                label: "Plays / Films / Dramas",
                query: "Category: Plays",
            },
            { slug: "romance", label: "Romance", query: "Category: Romance" },
            {
                slug: "sci-fi-fantasy",
                label: "Science-Fiction & Fantasy",
                query: "Category: Science-Fiction",
            },
            {
                slug: "crime-mystery",
                label: "Crime, Thrillers & Mystery",
                query: "Category: Crime, Thrillers",
            },
            {
                slug: "mythology",
                label: "Mythology, Legends & Folklore",
                query: "Category: Mythology, Legends",
            },
            { slug: "humour", label: "Humour", query: "Category: Humour" },
            {
                slug: "children-ya",
                label: "Children & Young Adult",
                query: "Category: Children",
            },
            {
                slug: "literature-other",
                label: "Literature — Other",
                query: "Category: Literature - Other",
            },
        ],
    },
    {
        heading: "Science & Technology",
        topics: [
            {
                slug: "engineering",
                label: "Engineering & Technology",
                query: "Category: Engineering",
            },
            {
                slug: "mathematics",
                label: "Mathematics",
                query: "Category: Mathematics",
            },
            {
                slug: "physics",
                label: "Physics",
                query: "Category: Science - Physics",
            },
            {
                slug: "chemistry",
                label: "Chemistry / Biochemistry",
                query: "Category: Science - Chemistry",
            },
            {
                slug: "biology",
                label: "Biology",
                query: "Category: Science - Biology",
            },
            {
                slug: "earth-science",
                label: "Earth / Agricultural / Farming",
                query: "Category: Science - Earth",
            },
            {
                slug: "research-methods",
                label: "Research Methods & Statistics",
                query: "Category: Research Methods",
            },
            {
                slug: "environmental",
                label: "Environmental Issues",
                query: "Category: Environmental Issues",
            },
        ],
    },
    {
        heading: "History",
        topics: [
            {
                slug: "history-american",
                label: "American",
                query: "Category: History - American",
            },
            {
                slug: "history-british",
                label: "British",
                query: "Category: History - British",
            },
            {
                slug: "history-european",
                label: "European",
                query: "Category: History - European",
            },
            {
                slug: "history-ancient",
                label: "Ancient",
                query: "Category: History - Ancient",
            },
            {
                slug: "history-medieval",
                label: "Medieval",
                query: "Category: History - Medieval",
            },
            {
                slug: "history-early-modern",
                label: "Early Modern (1450–1750)",
                query: "Category: History - Early Modern",
            },
            {
                slug: "history-modern",
                label: "Modern (1750+)",
                query: "Category: History - Modern",
            },
            {
                slug: "history-religious",
                label: "Religious",
                query: "Category: History - Religious",
            },
            {
                slug: "history-royalty",
                label: "Royalty",
                query: "Category: History - Royalty",
            },
            {
                slug: "history-warfare",
                label: "Warfare",
                query: "Category: History - Warfare",
            },
            {
                slug: "history-schools",
                label: "Schools & Universities",
                query: "Category: History - Schools",
            },
            {
                slug: "history-other",
                label: "Other",
                query: "Category: History - Other",
            },
            {
                slug: "archaeology",
                label: "Archaeology & Anthropology",
                query: "Category: Archaeology",
            },
        ],
    },
    {
        heading: "Social Sciences & Society",
        topics: [
            {
                slug: "business",
                label: "Business / Management",
                query: "Category: Business",
            },
            {
                slug: "economics",
                label: "Economics",
                query: "Category: Economics",
            },
            { slug: "law", label: "Law & Criminology", query: "Category: Law" },
            {
                slug: "gender-studies",
                label: "Gender & Sexuality Studies",
                query: "Category: Gender",
            },
            {
                slug: "psychology",
                label: "Psychiatry / Psychology",
                query: "Category: Psychiatry",
            },
            {
                slug: "sociology",
                label: "Sociology",
                query: "Category: Sociology",
            },
            {
                slug: "politics",
                label: "Politics",
                query: "Category: Politics",
            },
            {
                slug: "parenthood",
                label: "Parenthood & Family",
                query: "Category: Parenthood",
            },
            {
                slug: "old-age",
                label: "Old Age & the Elderly",
                query: "Category: Old Age",
            },
        ],
    },
    {
        heading: "Arts & Culture",
        topics: [
            { slug: "art", label: "Art", query: "Category: Art" },
            {
                slug: "architecture",
                label: "Architecture",
                query: "Category: Architecture",
            },
            { slug: "music", label: "Music", query: "Category: Music" },
            { slug: "fashion", label: "Fashion", query: "Category: Fashion" },
            {
                slug: "journalism",
                label: "Journalism / Media / Writing",
                query: "Category: Journalism",
            },
            {
                slug: "language",
                label: "Language & Communication",
                query: "Category: Language",
            },
            {
                slug: "essays",
                label: "Essays, Letters & Speeches",
                query: "Category: Essays",
            },
        ],
    },
    {
        heading: "Religion & Philosophy",
        topics: [
            {
                slug: "religion",
                label: "Religion / Spirituality",
                query: "Category: Religion",
            },
            {
                slug: "philosophy",
                label: "Philosophy & Ethics",
                query: "Category: Philosophy",
            },
        ],
    },
    {
        heading: "Lifestyle & Hobbies",
        topics: [
            {
                slug: "cooking",
                label: "Cooking & Drinking",
                query: "Category: Cooking",
            },
            {
                slug: "sports",
                label: "Sports / Hobbies",
                query: "Category: Sports",
            },
            { slug: "how-to", label: "How To…", query: "Category: How To" },
            {
                slug: "travel",
                label: "Travel Writing",
                query: "Category: Travel",
            },
            {
                slug: "nature",
                label: "Nature / Gardening / Animals",
                query: "Category: Nature",
            },
            {
                slug: "sexuality",
                label: "Sexuality & Erotica",
                query: "Category: Sexuality",
            },
        ],
    },
    {
        heading: "Health & Medicine",
        topics: [
            {
                slug: "health",
                label: "Health & Medicine",
                query: "Category: Health",
            },
            {
                slug: "drugs",
                label: "Drugs / Alcohol / Pharmacology",
                query: "Category: Drugs",
            },
            {
                slug: "nutrition",
                label: "Nutrition",
                query: "Category: Nutrition",
            },
        ],
    },
    {
        heading: "Education & Reference",
        topics: [
            {
                slug: "encyclopedias",
                label: "Encyclopedias / Dictionaries / Reference",
                query: "Category: Encyclopedias",
            },
            {
                slug: "teaching",
                label: "Teaching & Education",
                query: "Category: Teaching",
            },
            {
                slug: "reports",
                label: "Reports & Conference Proceedings",
                query: "Category: Reports",
            },
            {
                slug: "journals",
                label: "Journals",
                query: "Category: Journals",
            },
        ],
    },
]

const TOPIC_BY_SLUG = new Map(
    TOPIC_GROUPS.flatMap((group) => group.topics.map((t) => [t.slug, t]))
)

const DEFAULT_TOPIC_SLUG = "adventure"

function parseSort(value: string | undefined): BrowseSort {
    return value === "descending" ? "descending" : "popular"
}

async function BrowseBookListLoader({
    topicSlug,
    topicQuery,
    page,
    sort,
    initialKey,
}: {
    topicSlug: string
    topicQuery: string
    page: number
    sort: BrowseSort
    initialKey: string
}) {
    const initialData = await getBooksByTopic(topicQuery, page, sort)
    return (
        <BrowseBookList
            topicSlug={topicSlug}
            topicQuery={topicQuery}
            initialPage={page}
            sort={sort}
            initialData={initialData}
            initialKey={initialKey}
        />
    )
}

export default async function BrowsePage({
    searchParams,
}: {
    searchParams: Promise<{ topic?: string; page?: string; sort?: string }>
}) {
    const params = await searchParams
    const topicSlug =
        params.topic && TOPIC_BY_SLUG.has(params.topic)
            ? params.topic
            : DEFAULT_TOPIC_SLUG
    const activeTopic = TOPIC_BY_SLUG.get(topicSlug)!
    const page = Number(params.page) || 1
    const sort = parseSort(params.sort)
    const initialKey = `${topicSlug}|${page}|${sort}`

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10">
                <h1 className="font-heading text-4xl tracking-tight text-balance md:text-5xl">
                    Browse by Topic
                </h1>
                <p className="mt-3 text-lg text-muted-foreground">
                    Explore free ebooks organized by subject and category
                </p>
            </div>
            <div className="flex flex-col gap-8">
                <BrowseFilters
                    topicGroups={TOPIC_GROUPS}
                    activeTopicSlug={topicSlug}
                    activeSort={sort}
                />
                <Suspense key={initialKey} fallback={<BookGridSkeleton />}>
                    <BrowseBookListLoader
                        topicSlug={topicSlug}
                        topicQuery={activeTopic.query}
                        page={page}
                        sort={sort}
                        initialKey={initialKey}
                    />
                </Suspense>
            </div>
        </div>
    )
}
