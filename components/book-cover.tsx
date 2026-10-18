"use client"

import { useState } from "react"
import Image from "next/image"
import { BookOpen01Icon } from "hugeicons-react"

interface BookCoverProps {
    title: string
    coverUrl: string | null
    priority?: boolean
}

export function BookCover({
    title,
    coverUrl,
    priority = false,
}: BookCoverProps) {
    const [failed, setFailed] = useState(false)

    if (!coverUrl || failed) {
        return (
            <div className="book-jacket-fallback">
                <BookOpen01Icon className="size-7 shrink-0" />
                <span className="line-clamp-3">{title}</span>
            </div>
        )
    }

    return (
        <Image
            src={coverUrl}
            alt=""
            fill
            sizes="(max-width: 639px) 34vw, (max-width: 1023px) 24vw, 180px"
            className="object-cover"
            priority={priority}
            onError={() => setFailed(true)}
        />
    )
}
