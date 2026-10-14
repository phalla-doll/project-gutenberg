"use client"

import { useEffect, useRef, type PointerEvent } from "react"
import { Book } from "@/components/book-card-2"

const REST = { rx: -5, ry: -30, gx: 70 }

interface Book3DPreviewProps {
    title: string
    coverUrl: string | null
    width?: number
}

export function Book3DPreview({
    title,
    coverUrl,
    width = 240,
}: Book3DPreviewProps) {
    const stageRef = useRef<HTMLDivElement>(null)
    const frameRef = useRef(0)

    useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

    function pose(rx: number, ry: number, gx: number) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = requestAnimationFrame(() => {
            const stage = stageRef.current
            if (!stage) return
            stage.style.setProperty("--rx", `${rx}deg`)
            stage.style.setProperty("--ry", `${ry}deg`)
            stage.style.setProperty("--gx", `${gx}%`)
        })
    }

    function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return
        }
        const rect = event.currentTarget.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        event.currentTarget.dataset.active = ""
        pose(
            REST.rx - y * 16,
            Math.max(-70, REST.ry + x * 116),
            REST.gx - x * 110
        )
    }

    function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
        delete event.currentTarget.dataset.active
        pose(REST.rx, REST.ry, REST.gx)
    }

    return (
        <div
            ref={stageRef}
            className="book-stage flex w-full justify-center px-6 pt-6 pb-12"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerLeave}
        >
            <Book
                title={title}
                width={width}
                coverUrl={coverUrl}
                coverAlt={title}
                textured
                solid
                priority
            />
        </div>
    )
}
