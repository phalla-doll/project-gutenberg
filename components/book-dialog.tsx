"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface BookDialogProps {
    title: string
    children: React.ReactNode
}

export function BookDialog({ title, children }: BookDialogProps) {
    const router = useRouter()
    const contentRef = useRef<HTMLDivElement>(null)

    return (
        <Dialog
            defaultOpen
            onOpenChange={(open) => {
                if (!open) router.back()
            }}
        >
            <DialogContent
                ref={contentRef}
                aria-describedby={undefined}
                onOpenAutoFocus={(event) => {
                    event.preventDefault()
                    contentRef.current?.focus({ preventScroll: true })
                }}
                className="max-h-[calc(100svh-2rem)] gap-0 overflow-hidden bg-background p-0 sm:max-w-5xl md:h-[min(44rem,calc(100svh-4rem))] md:grid-rows-1"
            >
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <div className="max-h-[calc(100svh-2rem)] overflow-y-auto overscroll-contain md:h-full md:max-h-none md:overflow-visible">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}
