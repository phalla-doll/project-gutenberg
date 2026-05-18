"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { BrowseSort } from "@/lib/gutendex"
import type { BrowseTopicGroup } from "./page"

const SORT_OPTIONS: { value: BrowseSort; label: string }[] = [
    { value: "popular", label: "Popular" },
    { value: "descending", label: "Recently added" },
]

interface BrowseFiltersProps {
    topicGroups: BrowseTopicGroup[]
    activeTopicSlug: string
    activeSort: BrowseSort
}

export function BrowseFilters({
    topicGroups,
    activeTopicSlug,
    activeSort,
}: BrowseFiltersProps) {
    const router = useRouter()
    const [, startTransition] = useTransition()
    const [selectedSlug, setSelectedSlug] = useState(activeTopicSlug)
    const [sort, setSort] = useState<BrowseSort>(activeSort)

    useEffect(() => {
        setSelectedSlug(activeTopicSlug)
    }, [activeTopicSlug])

    useEffect(() => {
        setSort(activeSort)
    }, [activeSort])

    const topicBySlug = useMemo(
        () =>
            new Map(
                topicGroups.flatMap((g) => g.topics.map((t) => [t.slug, t]))
            ),
        [topicGroups]
    )

    const groupOfActive =
        topicGroups.find((g) =>
            g.topics.some((t) => t.slug === selectedSlug)
        ) ?? topicGroups[0]
    const [activeGroupHeading, setActiveGroupHeading] = useState(
        groupOfActive.heading
    )
    const activeGroup =
        topicGroups.find((g) => g.heading === activeGroupHeading) ??
        topicGroups[0]

    function pushUrl(slug: string, nextSort: BrowseSort) {
        const params = new URLSearchParams()
        params.set("topic", slug)
        if (nextSort !== "popular") params.set("sort", nextSort)
        router.push(`/browse?${params.toString()}`)
    }

    function handleTopicChange(slug: string) {
        if (slug === selectedSlug) return
        setSelectedSlug(slug)
        startTransition(() => pushUrl(slug, sort))
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    function handleSortChange(nextSort: BrowseSort) {
        if (nextSort === sort) return
        setSort(nextSort)
        startTransition(() => pushUrl(selectedSlug, nextSort))
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <>
            <section
                aria-label="Browse filters"
                className="rounded-2xl border border-border/70 bg-card/40"
            >
                <div
                    role="tablist"
                    aria-label="Category group"
                    className="flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2 sm:px-4"
                >
                    {topicGroups.map((group) => {
                        const isActive = group.heading === activeGroup.heading
                        const containsSelected = group.topics.some(
                            (t) => t.slug === selectedSlug
                        )
                        return (
                            <button
                                key={group.heading}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() =>
                                    setActiveGroupHeading(group.heading)
                                }
                                className={`relative shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 font-heading text-sm tracking-wide transition-colors ${
                                    isActive
                                        ? "bg-background text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {group.heading}
                                {!isActive && containsSelected && (
                                    <span
                                        aria-hidden
                                        className="ml-1.5 inline-block size-1.5 rounded-full bg-foreground/70 align-middle"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
                <div
                    className="flex flex-wrap gap-1.5 px-5 py-5 sm:px-6"
                    role="group"
                    aria-label={`Filter by ${activeGroup.heading}`}
                >
                    {activeGroup.topics.map(({ slug, label }) => {
                        const isActive = selectedSlug === slug
                        return (
                            <button
                                key={slug}
                                type="button"
                                onClick={() => handleTopicChange(slug)}
                                aria-pressed={isActive}
                                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                                    isActive
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border/70 bg-background/60 text-foreground/80 hover:border-foreground/40 hover:text-foreground"
                                }`}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            </section>

            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {activeGroup.heading}
                    </span>
                    <p className="font-heading text-2xl text-foreground">
                        {topicBySlug.get(selectedSlug)?.label}
                    </p>
                </div>
                <div
                    className="flex items-center gap-3"
                    role="group"
                    aria-label="Sort books"
                >
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Sort
                    </span>
                    <div className="inline-flex items-center rounded-full border border-border/70 bg-background/60 p-0.5">
                        {SORT_OPTIONS.map(({ value, label }) => {
                            const isActive = sort === value
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleSortChange(value)}
                                    aria-pressed={isActive}
                                    className={`rounded-full px-3.5 py-1 text-sm transition-colors ${
                                        isActive
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}
