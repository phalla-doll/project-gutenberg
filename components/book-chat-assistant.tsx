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
}

interface BookChatAssistantProps {
    bookId: number
    title: string
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
            "Ask me about this book. I can answer from its summary and subjects.",
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

export function BookChatAssistant({ bookId, title }: BookChatAssistantProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
    const [isSending, setIsSending] = useState(false)
    const messagesRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesRef.current?.scrollTo({
            top: messagesRef.current.scrollHeight,
            behavior: "smooth",
        })
    }, [messages])

    async function sendMessage(content: string) {
        const question = content.trim()
        if (!question || isSending) return

        const nextMessages: ChatMessage[] = [
            ...messages,
            { role: "user", content: question },
        ]

        setInput("")
        setIsSending(true)
        setMessages([...nextMessages, { role: "assistant", content: "" }])

        try {
            const apiMessages = nextMessages.filter(
                (message, index) =>
                    !(index === 0 && message.role === "assistant")
            )

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
        void sendMessage(input)
    }

    function startNewChat() {
        setInput("")
        setMessages(initialMessages)
    }

    return (
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
                                    "max-w-[88%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                                    message.role === "user"
                                        ? "ml-auto bg-primary text-primary-foreground"
                                        : "mr-auto bg-card text-body-strong"
                                )}
                            >
                                {message.content ? (
                                    message.role === "assistant" ? (
                                        formatAssistantContent(message.content)
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
                                        onClick={() => sendMessage(question)}
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
                            <Textarea
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
                                        void sendMessage(input)
                                    }
                                }}
                                placeholder="Ask about this book..."
                                aria-label="Ask about this book"
                                rows={1}
                                disabled={isSending}
                                className="max-h-28 min-h-10 py-2"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                aria-label="Send message"
                                disabled={!input.trim() || isSending}
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
                size="lg"
                className="h-12 gap-2 shadow-xl shadow-foreground/20"
                aria-expanded={isOpen}
                aria-label={
                    isOpen ? "Close The Librarian" : "Open The Librarian"
                }
                onClick={() => setIsOpen((current) => !current)}
            >
                <BubbleChatSparkIcon className="size-4" aria-hidden="true" />
                Ask about book
            </Button>
        </div>
    )
}
