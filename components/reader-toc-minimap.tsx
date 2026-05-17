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
    const ids = useMemo(() => items.map((item) => item.id), [items])

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
                    "max-h-[calc(70svh-1rem)] overflow-x-hidden overflow-y-auto",
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
        </nav>
    )
}
