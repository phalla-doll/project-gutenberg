"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { ReaderTocItem } from "@/components/reader-types"

interface ReaderTocMinimapProps {
    items: ReaderTocItem[]
    activeId?: string
}

export function ReaderTocMinimap({
    items,
    activeId: controlledActiveId,
}: ReaderTocMinimapProps) {
    const [localActiveId, setLocalActiveId] = useState(items[0]?.id ?? "")
    const [isExpanded, setIsExpanded] = useState(false)
    const ids = useMemo(() => items.map((item) => item.id), [items])
    const activeId = controlledActiveId ?? localActiveId

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
                    setLocalActiveId(visible[0].target.id)
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
                isExpanded ? "w-56" : "w-12"
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
                    "max-h-[70svh] scrollbar-none overflow-x-hidden overflow-y-auto",
                    isExpanded ? "px-2" : "px-0"
                )}
            >
                <div
                    className={cn(
                        "flex flex-col transition-[gap] duration-150 ease-out",
                        isExpanded ? "gap-1" : "gap-px"
                    )}
                >
                    {items.map((item, index) => {
                        const isActive = activeId === item.id
                        const isCollapsedMarker = (index + 1) % 5 === 0

                        return (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                aria-current={isActive ? "location" : undefined}
                                aria-label={`Scroll to ${item.title}`}
                                className={cn(
                                    "group flex items-center transition-[height] duration-150 ease-out outline-none",
                                    isExpanded
                                        ? "h-7 gap-3"
                                        : "h-2 justify-center gap-0"
                                )}
                            >
                                <span
                                    className={cn(
                                        "h-0.5 shrink-0 rounded-full bg-[var(--reader-muted)] transition-[width,background-color,opacity] duration-150 ease-out",
                                        isExpanded
                                            ? isActive
                                                ? "w-4 bg-primary"
                                                : "w-2 opacity-55 group-hover:opacity-90"
                                            : isActive
                                              ? "w-5"
                                              : isCollapsedMarker
                                                ? "w-4 opacity-45 group-hover:opacity-75"
                                                : "w-3 opacity-35 group-hover:opacity-65",
                                        isActive && "bg-primary"
                                    )}
                                    aria-hidden="true"
                                />
                                <span
                                    className={cn(
                                        "truncate text-xs font-medium text-[var(--reader-muted)] opacity-0 transition-[color,opacity] duration-100 ease-out group-hover:text-[var(--reader-text)]",
                                        isExpanded && "opacity-100",
                                        isActive && "text-[var(--reader-text)]"
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
