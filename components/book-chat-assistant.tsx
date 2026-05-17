"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
    ArrowUpBigIcon,
    BubbleChatAddIcon,
    BubbleChatSparkIcon,
    Cancel01Icon,
    Robot01Icon,
} from "hugeicons-react"

type ChatMessage = {
    role: "user" | "assistant"
    content: string
    apiContent?: string
    selectedWordCount?: number
}

interface BookChatAssistantProps {
    bookId: number
    title: string
    launcherLabel?: string
    launcherTone?: "default" | "reader"
    enableSelectionAsk?: boolean
}

const starterQuestions = [
    "What is this book about?",
    "What themes does it cover?",
    "Who might enjoy it?",
]

const initialMessages: ChatMessage[] = [
    {
        role: "assistant",
        content:
            "Ask me about this book, or highlight a passage while reading.",
    },
]

function formatAssistantContent(content: string) {
    return content
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/(^|\n)\s*[-*]\s+/g, "$1")
        .replace(/:\s+\*\s+/g, ": ")
        .replace(/\s+\*\s+/g, "; ")
        .replace(/\*/g, "")
}

function countWords(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length
}

export function BookChatAssistant({
    bookId,
    title,
    launcherLabel = "Ask Librarian",
    launcherTone = "default",
    enableSelectionAsk = false,
}: BookChatAssistantProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
    const [isSending, setIsSending] = useState(false)
    const [selectedText, setSelectedText] = useState("")
    const [pendingSelectedText, setPendingSelectedText] = useState("")
    const [selectionPosition, setSelectionPosition] = useState<{
        top: number
        left: number
    } | null>(null)
    const messagesRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const pendingSelectedWordCount = countWords(pendingSelectedText)

    useEffect(() => {
        if (!enableSelectionAsk) return

        let frameId: number | null = null

        const updateSelection = () => {
            frameId = null

            const selection = window.getSelection()
            const text = selection?.toString().trim() ?? ""
            const range = selection?.rangeCount ? selection.getRangeAt(0) : null
            const readerContent = document.querySelector(
                "[data-reader-content]"
            )

            if (
                !selection ||
                !range ||
                !readerContent ||
                selection.isCollapsed ||
                text.length < 2 ||
                !readerContent.contains(range.commonAncestorContainer)
            ) {
                setSelectedText("")
                setSelectionPosition(null)
                return
            }

            const rect = range.getBoundingClientRect()
            if (!rect.width && !rect.height) {
                setSelectedText("")
                setSelectionPosition(null)
                return
            }

            setSelectedText(text.slice(0, 1800))
            setSelectionPosition({
                top: Math.max(72, rect.top - 46),
                left: Math.min(
                    window.innerWidth - 94,
                    Math.max(16, rect.left + rect.width / 2 - 47)
                ),
            })
        }

        const scheduleSelectionUpdate = () => {
            if (frameId !== null) return
            frameId = window.requestAnimationFrame(updateSelection)
        }

        document.addEventListener("selectionchange", scheduleSelectionUpdate)
        document.addEventListener("mouseup", scheduleSelectionUpdate)
        document.addEventListener("keyup", scheduleSelectionUpdate)
        document.addEventListener("touchend", scheduleSelectionUpdate)
        window.addEventListener("resize", scheduleSelectionUpdate)
        window.addEventListener("scroll", scheduleSelectionUpdate, {
            passive: true,
        })

        return () => {
            if (frameId !== null) window.cancelAnimationFrame(frameId)
            document.removeEventListener(
                "selectionchange",
                scheduleSelectionUpdate
            )
            document.removeEventListener("mouseup", scheduleSelectionUpdate)
            document.removeEventListener("keyup", scheduleSelectionUpdate)
            document.removeEventListener("touchend", scheduleSelectionUpdate)
            window.removeEventListener("resize", scheduleSelectionUpdate)
            window.removeEventListener("scroll", scheduleSelectionUpdate)
        }
    }, [enableSelectionAsk])

    useEffect(() => {
        messagesRef.current?.scrollTo({
            top: messagesRef.current.scrollHeight,
            behavior: "smooth",
        })
    }, [messages])

    useEffect(() => {
        if (!isOpen || !pendingSelectedText) return
        inputRef.current?.focus()
    }, [isOpen, pendingSelectedText])

    async function sendMessage(content: string, selectedPassage = "") {
        const question = content.trim()
        const passage = selectedPassage.trim()
        if ((!question && !passage) || isSending) return

        const displayContent = question || "What does this passage mean?"
        const apiContent = passage
            ? `${displayContent}\n\nSelected passage:\n${passage}`
            : displayContent

        const nextMessages: ChatMessage[] = [
            ...messages,
            {
                role: "user",
                content: displayContent,
                apiContent,
                selectedWordCount: passage ? countWords(passage) : undefined,
            },
        ]

        setInput("")
        setPendingSelectedText("")
        setIsSending(true)
        setMessages([...nextMessages, { role: "assistant", content: "" }])

        try {
            const apiMessages = nextMessages
                .filter(
                    (message, index) =>
                        !(index === 0 && message.role === "assistant")
                )
                .map(({ role, content, apiContent }) => ({
                    role,
                    content: apiContent ?? content,
                }))

            const response = await fetch("/api/book-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookId,
                    messages: apiMessages,
                }),
            })

            if (!response.ok || !response.body) {
                throw new Error("Failed to start book chat")
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let assistantContent = ""

            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                assistantContent += decoder.decode(value, { stream: true })
                setMessages([
                    ...nextMessages,
                    { role: "assistant", content: assistantContent },
                ])
            }
        } catch {
            setMessages([
                ...nextMessages,
                {
                    role: "assistant",
                    content:
                        "I could not reach the book assistant right now. Please try again in a moment.",
                },
            ])
        } finally {
            setIsSending(false)
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        void sendMessage(input, pendingSelectedText)
    }

    function startNewChat() {
        setInput("")
        setPendingSelectedText("")
        setMessages(initialMessages)
    }

    function askAboutSelection() {
        const passage = selectedText.trim()
        if (!passage) return

        setInput("")
        setPendingSelectedText(passage)
        setSelectedText("")
        setSelectionPosition(null)
        setIsOpen(true)
    }

    return (
        <>
            {enableSelectionAsk && selectionPosition && (
                <Button
                    type="button"
                    size="sm"
                    className="fixed z-[60] h-9 gap-1.5 px-3 shadow-xl shadow-foreground/20"
                    style={{
                        top: selectionPosition.top,
                        left: selectionPosition.left,
                    }}
                    aria-label="Ask AI about selected text"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={askAboutSelection}
                >
                    <BubbleChatSparkIcon
                        className="size-4"
                        aria-hidden="true"
                    />
                    Ask AI
                </Button>
            )}

            <div className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:right-6 sm:bottom-6">
                {isOpen && (
                    <section
                        className="flex h-[min(620px,calc(100svh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden border border-border bg-background shadow-2xl shadow-foreground/15"
                        aria-label={`The Librarian for ${title}`}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-soft px-4 py-3">
                            <div className="flex min-w-0 gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary ring-1 ring-primary/20">
                                    <Robot01Icon
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-heading text-lg leading-5">
                                        The Librarian
                                    </h2>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {title}
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Start a new chat"
                                    onClick={startNewChat}
                                    disabled={isSending}
                                >
                                    <BubbleChatAddIcon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Close The Librarian"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Cancel01Icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Button>
                            </div>
                        </div>

                        <div
                            ref={messagesRef}
                            className="flex flex-1 scrollbar-none flex-col gap-3 overflow-y-auto px-4 py-4"
                        >
                            {messages.map((message, index) => (
                                <div
                                    key={`${message.role}-${index}`}
                                    className={cn(
                                        "flex max-w-[88%] flex-col gap-1.5 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                                        message.role === "user"
                                            ? "ml-auto bg-primary text-primary-foreground"
                                            : "mr-auto bg-card text-body-strong"
                                    )}
                                >
                                    {message.role === "user" &&
                                        message.selectedWordCount && (
                                            <span className="w-fit border border-primary-foreground/35 px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-normal text-primary-foreground/85 normal-case">
                                                Selected{" "}
                                                {message.selectedWordCount}{" "}
                                                words
                                            </span>
                                        )}
                                    {message.content ? (
                                        message.role === "assistant" ? (
                                            formatAssistantContent(
                                                message.content
                                            )
                                        ) : (
                                            message.content
                                        )
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Reading...
                                        </span>
                                    )}
                                </div>
                            ))}

                            {messages.length === 1 && (
                                <div className="flex flex-col gap-2 pt-1">
                                    {starterQuestions.map((question) => (
                                        <Button
                                            key={question}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-auto justify-start py-2 text-left normal-case"
                                            onClick={() =>
                                                sendMessage(question)
                                            }
                                        >
                                            {question}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="border-t border-border bg-surface-soft px-4 py-3"
                        >
                            <div className="flex items-end gap-3">
                                <div className="flex flex-1 flex-col">
                                    {pendingSelectedWordCount > 0 && (
                                        <div className="mb-2 flex items-center justify-between gap-2 border border-border bg-background px-2.5 py-1.5">
                                            <span className="text-[11px] leading-none font-semibold tracking-normal text-muted-foreground normal-case">
                                                Selected{" "}
                                                {pendingSelectedWordCount} words
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                className="-my-1 -mr-1"
                                                aria-label="Clear selected text"
                                                onClick={() =>
                                                    setPendingSelectedText("")
                                                }
                                                disabled={isSending}
                                            >
                                                <Cancel01Icon
                                                    className="size-3"
                                                    aria-hidden="true"
                                                />
                                            </Button>
                                        </div>
                                    )}
                                    <Textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(event) =>
                                            setInput(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" &&
                                                !event.shiftKey
                                            ) {
                                                event.preventDefault()
                                                void sendMessage(
                                                    input,
                                                    pendingSelectedText
                                                )
                                            }
                                        }}
                                        placeholder={
                                            pendingSelectedWordCount > 0
                                                ? "Ask about this passage..."
                                                : "Ask about this book..."
                                        }
                                        aria-label="Ask about this book"
                                        rows={1}
                                        disabled={isSending}
                                        className="max-h-28 min-h-10 py-2"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="icon"
                                    aria-label="Send message"
                                    disabled={
                                        (!input.trim() &&
                                            !pendingSelectedText.trim()) ||
                                        isSending
                                    }
                                >
                                    <ArrowUpBigIcon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Button>
                            </div>
                        </form>
                    </section>
                )}

                <Button
                    type="button"
                    variant={launcherTone === "reader" ? "outline" : "default"}
                    size={launcherTone === "reader" ? "sm" : "lg"}
                    className={cn(
                        "gap-2",
                        launcherTone === "reader"
                            ? "h-10 bg-background/95 shadow-lg shadow-foreground/10 backdrop-blur"
                            : "h-12 shadow-xl shadow-foreground/20"
                    )}
                    aria-expanded={isOpen}
                    aria-label={
                        isOpen ? "Close The Librarian" : "Open The Librarian"
                    }
                    onClick={() => setIsOpen((current) => !current)}
                >
                    <BubbleChatSparkIcon
                        className="size-4"
                        aria-hidden="true"
                    />
                    {launcherLabel}
                </Button>
            </div>
        </>
    )
}
