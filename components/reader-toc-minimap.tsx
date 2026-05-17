"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

export interface ReaderTocItem {
    id: string
    title: string
}

interface ReaderTocMinimapProps {
    items: ReaderTocItem[]
}

export function ReaderTocMinimap({ items }: ReaderTocMinimapProps) {
    const [activeId, setActiveId] = useState(items[0]?.id ?? "")
    const [isExpanded, setIsExpanded] = useState(false)
    const [readingProgress, setReadingProgress] = useState(0)
    const ids = useMemo(() => items.map((item) => item.id), [items])
    const expandedProgress = `${readingProgress.toFixed(2)}% reading progress`
    const collapsedProgress = `${Math.round(readingProgress)}%`

    useEffect(() => {
        if (!ids.length) return

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top
                    )

                if (visible[0]) {
                    setActiveId(visible[0].target.id)
                }
            },
            { rootMargin: "-18% 0px -72% 0px", threshold: 0 }
        )

        ids.forEach((id) => {
            const element = document.getElementById(id)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [ids])

    useEffect(() => {
        let frameId: number | null = null

        const updateProgress = () => {
            frameId = null

            const readerContent = document.querySelector<HTMLElement>(
                "[data-reader-content]"
            )
            if (!readerContent) return

            const start = readerContent.offsetTop
            const end =
                readerContent.offsetTop +
                readerContent.scrollHeight -
                window.innerHeight
            const distance = Math.max(end - start, 1)
            const progress = ((window.scrollY - start) / distance) * 100

            setReadingProgress(Math.min(100, Math.max(0, progress)))
        }

        const scheduleUpdate = () => {
            if (frameId !== null) return
            frameId = window.requestAnimationFrame(updateProgress)
        }

        scheduleUpdate()
        window.addEventListener("scroll", scheduleUpdate, { passive: true })
        window.addEventListener("resize", scheduleUpdate)

        return () => {
            if (frameId !== null) window.cancelAnimationFrame(frameId)
            window.removeEventListener("scroll", scheduleUpdate)
            window.removeEventListener("resize", scheduleUpdate)
        }
    }, [])

    if (items.length < 2) return null

    return (
        <nav
            aria-label="Book sections"
            className={cn(
                "fixed top-1/2 right-6 z-40 hidden max-h-[70svh] -translate-y-1/2 overflow-hidden py-2 transition-[width] duration-150 ease-out xl:block",
                isExpanded ? "w-56" : "w-8"
            )}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            onFocus={() => setIsExpanded(true)}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsExpanded(false)
                }
            }}
        >
            <div
                className={cn(
                    "max-h-[calc(70svh-3rem)] scrollbar-none overflow-x-hidden overflow-y-auto",
                    isExpanded ? "px-2" : "px-0"
                )}
            >
                <div
                    className={cn(
                        "flex flex-col transition-[gap] duration-150 ease-out",
                        isExpanded ? "gap-1" : "gap-0.5"
                    )}
                >
                    {items.map((item) => {
                        const isActive = activeId === item.id

                        return (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                aria-current={isActive ? "location" : undefined}
                                aria-label={`Scroll to ${item.title}`}
                                className={cn(
                                    "group flex items-center transition-[height] duration-150 ease-out outline-none",
                                    isExpanded ? "h-7 gap-3" : "h-2.5 gap-0"
                                )}
                            >
                                <span
                                    className={cn(
                                        "h-0.5 shrink-0 rounded-full transition-[width,background-color] duration-150 ease-out",
                                        isExpanded
                                            ? isActive
                                                ? "w-4 bg-primary"
                                                : "w-2 bg-muted-foreground/35 group-hover:bg-muted-foreground/70"
                                            : isActive
                                              ? "w-4 bg-primary"
                                              : "w-3 bg-muted-foreground/25 group-hover:bg-muted-foreground/50"
                                    )}
                                    aria-hidden="true"
                                />
                                <span
                                    className={cn(
                                        "truncate text-xs font-medium text-muted-foreground opacity-0 transition-opacity duration-100 ease-out group-hover:text-foreground",
                                        isExpanded && "opacity-100",
                                        isActive && "text-foreground"
                                    )}
                                >
                                    {item.title}
                                </span>
                            </a>
                        )
                    })}
                </div>
            </div>
            <div
                className={cn(
                    "mx-auto mt-3 border-t border-border/70 pt-2 text-center text-[10px] leading-none font-semibold tracking-normal text-muted-foreground tabular-nums transition-[width,color] duration-150",
                    isExpanded ? "w-[calc(100%-1rem)] text-xs" : "w-8"
                )}
                aria-label={expandedProgress}
            >
                {isExpanded ? expandedProgress : collapsedProgress}
            </div>
        </nav>
    )
}
