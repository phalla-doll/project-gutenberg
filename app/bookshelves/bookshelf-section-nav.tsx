"use client"

import { useEffect, useRef, useState } from "react"

interface BookshelfSectionNavProps {
    sections: { heading: string; id: string }[]
}

export function BookshelfSectionNav({ sections }: BookshelfSectionNavProps) {
    const navRef = useRef<HTMLElement>(null)
    const [overflow, setOverflow] = useState({ left: false, right: false })

    useEffect(() => {
        const el = navRef.current
        if (!el) return

        const update = () => {
            const { scrollLeft, scrollWidth, clientWidth } = el

            setOverflow({
                left: scrollLeft > 0,
                right: scrollLeft + clientWidth < scrollWidth - 1,
            })
        }

        update()
        const raf = requestAnimationFrame(update)
        el.addEventListener("scroll", update, { passive: true })
        window.addEventListener("resize", update)

        const ro = new ResizeObserver(update)
        ro.observe(el)

        return () => {
            cancelAnimationFrame(raf)
            el.removeEventListener("scroll", update)
            window.removeEventListener("resize", update)
            ro.disconnect()
        }
    }, [sections.length])

    const maskImage =
        overflow.left && overflow.right
            ? "linear-gradient(to right, transparent, black 1.5rem, black calc(100% - 1.5rem), transparent)"
            : overflow.left
              ? "linear-gradient(to right, transparent, black 1.5rem)"
              : overflow.right
                ? "linear-gradient(to right, black calc(100% - 1.5rem), transparent)"
                : undefined

    return (
        <nav
            ref={navRef}
            aria-label="Jump to section"
            className="-mx-4 mb-10 scrollbar-none overflow-x-auto px-4"
            style={{
                maskImage,
                WebkitMaskImage: maskImage,
            }}
        >
            <div className="inline-flex items-center rounded-full border border-border/70 bg-background/60 p-0.5">
                {sections.map((section) => (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="rounded-full px-3.5 py-1 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {section.heading}
                    </a>
                ))}
            </div>
        </nav>
    )
}
