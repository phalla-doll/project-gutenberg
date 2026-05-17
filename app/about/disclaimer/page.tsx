import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getAbsoluteUrl, siteName } from "@/lib/site-metadata"
import {
    AiLearningIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    BookOpen01Icon,
    InformationCircleIcon,
    Link03Icon,
} from "hugeicons-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "About & Disclaimer",
    description:
        "Learn why Project Sonam exists, how it uses public ebook data, and why it is not an official Project Gutenberg website.",
    alternates: {
        canonical: "/about/disclaimer",
    },
    openGraph: {
        title: `About & Disclaimer - ${siteName}`,
        description:
            "Project Sonam is an independent reading experience for discovering and learning from public-domain books.",
        url: getAbsoluteUrl("/about/disclaimer"),
    },
}

const principles = [
    {
        icon: InformationCircleIcon,
        title: "Independent project",
        body: "Project Sonam is not affiliated with, sponsored by, or officially connected to Project Gutenberg.",
    },
    {
        icon: BookOpen01Icon,
        title: "Public-domain access",
        body: "The site helps readers discover free ebooks using open catalog data and links back to original sources where possible.",
    },
    {
        icon: AiLearningIcon,
        title: "AI-assisted learning",
        body: "The goal is to make books easier to explore, summarize, question, and understand so readers can learn faster.",
    },
]

export default function AboutDisclaimerPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                    <p className="font-mono text-xs font-medium text-primary uppercase">
                        About & Disclaimer
                    </p>
                    <h1 className="mt-4 max-w-3xl font-heading text-4xl leading-tight text-balance md:text-6xl">
                        An independent way to learn from public-domain books
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                        Project Sonam is built to make classic books easier to
                        browse, read, and learn from. It is designed for readers
                        who want a faster path from discovering a book to
                        understanding its ideas with help from modern AI tools.
                    </p>
                </div>

                <div className="border-l border-primary/40 bg-surface-soft px-5 py-5">
                    <p className="text-sm font-medium text-body-strong">
                        Important note
                    </p>
                    <p className="mt-3 text-sm leading-7 text-body-text">
                        This website is not the official Project Gutenberg
                        website. Project Gutenberg is a separate organization
                        with its own mission, catalog, terms, and services.
                    </p>
                </div>
            </section>

            <section className="mt-14 grid gap-4 md:grid-cols-3">
                {principles.map(({ icon: Icon, title, body }) => (
                    <article
                        key={title}
                        className="rounded-md border border-hairline-soft bg-card p-5"
                    >
                        <Icon className="size-6 text-primary" aria-hidden />
                        <h2 className="mt-5 font-heading text-2xl">{title}</h2>
                        <p className="mt-3 text-sm leading-7 text-body-text">
                            {body}
                        </p>
                    </article>
                ))}
            </section>

            <section className="mt-14 grid gap-8 border-y border-hairline-soft py-10 md:grid-cols-[0.8fr_1.2fr]">
                <h2 className="font-heading text-3xl">Why this exists</h2>
                <div className="space-y-5 text-base leading-8 text-body-text">
                    <p>
                        Many public-domain books are valuable but difficult to
                        approach. Project Sonam experiments with a more useful
                        reading flow: search quickly, open a readable text, and
                        use AI as a study companion for summaries, context,
                        questions, and faster comprehension.
                    </p>
                    <p>
                        The intent is to support learning, not to replace the
                        original works, their sources, or careful reading.
                        Readers should still verify important details against
                        the source text.
                    </p>
                </div>
            </section>

            <section className="mt-10 flex flex-col gap-6 rounded-md bg-surface-dark p-6 text-on-dark sm:p-8 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-heading text-3xl">Credit & contact</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-on-dark-soft">
                        Project Sonam is built by Mantha. For feedback,
                        questions, or project notes, visit the personal site.
                    </p>
                </div>
                <Button asChild className="w-full gap-2 sm:w-fit">
                    <a
                        href="https://manthaa.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Link03Icon className="size-4" aria-hidden />
                        Mantha
                        <ArrowRight01Icon className="size-4" aria-hidden />
                    </a>
                </Button>
            </section>

            <Separator className="my-10" />

            <Button asChild variant="ghost" className="gap-2">
                <Link href="/">
                    <ArrowLeft01Icon className="size-4" aria-hidden />
                    Back to books
                </Link>
            </Button>
        </div>
    )
}
