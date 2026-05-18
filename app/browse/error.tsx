"use client"

import { useEffect } from "react"

export default function BrowseError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xl rounded-2xl border border-border/70 bg-card/40 p-8 text-center">
                <h2 className="font-heading text-2xl tracking-tight">
                    Couldn’t load these books
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                    The book catalog is taking longer than usual to respond.
                    This is usually temporary.
                </p>
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        type="button"
                        onClick={reset}
                        className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition-colors hover:bg-foreground/90"
                    >
                        Try again
                    </button>
                </div>
            </div>
        </div>
    )
}
