"use client"

import { sendGAEvent } from "@next/third-parties/google"

export function trackEvent(
    action: string,
    params: Record<string, string | number | boolean> = {}
) {
    sendGAEvent("event", action, params)
}

export function trackPageView(url: string) {
    sendGAEvent("event", "page_view", { page_path: url })
}

export function trackSearch(searchTerm: string) {
    sendGAEvent("event", "search", { search_term: searchTerm })
}

export function trackBookView(bookId: number, title: string) {
    sendGAEvent("event", "view_book", {
        book_id: bookId,
        book_title: title,
    })
}

export function trackTopicFilter(topic: string) {
    sendGAEvent("event", "filter_by_topic", { topic })
}

export function trackAuthorFilter(author: string) {
    sendGAEvent("event", "filter_by_author", { author })
}
