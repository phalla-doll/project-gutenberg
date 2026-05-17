"use client"

import { useState, useEffect, useCallback } from "react"
import type { PaginatedResponse, Book } from "@/lib/gutendex"
import { getCached, setCache } from "@/lib/book-cache"

interface HookState {
    key: string | null
    result: PaginatedResponse<Book> | null
    error: Error | null
}

interface UsePaginatedBooksResult {
    data: PaginatedResponse<Book> | null
    loading: boolean
    error: Error | null
    retry: () => void
}

export function usePaginatedBooks(
    fetchFn: () => Promise<PaginatedResponse<Book>>,
    key: string,
    options?: {
        enabled?: boolean
        initialData?: PaginatedResponse<Book>
        initialKey?: string
    }
): UsePaginatedBooksResult {
    const { enabled = true, initialData, initialKey } = options ?? {}

    const [retryCount, setRetryCount] = useState(0)
    const [state, setState] = useState<HookState>(() => {
        if (initialData && initialKey) {
            setCache(initialKey, initialData)
            return { key: initialKey, result: initialData, error: null }
        }
        return { key: null, result: null, error: null }
    })

    const loading = enabled && state.key !== key

    useEffect(() => {
        if (!enabled) return
        let cancelled = false

        const cached = getCached(key)
        const promise = cached ? Promise.resolve(cached) : fetchFn()

        promise
            .then((result) => {
                if (!cancelled) {
                    setCache(key, result)
                    setState({ key, result, error: null })
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setState({
                        key,
                        result: null,
                        error:
                            err instanceof Error ? err : new Error(String(err)),
                    })
                }
            })

        return () => {
            cancelled = true
        }
    }, [key, enabled, fetchFn, retryCount])

    const retry = useCallback(() => {
        setState({ key: null, result: null, error: null })
        setRetryCount((c) => c + 1)
    }, [])

    return {
        data: state.result,
        loading,
        error: !loading ? state.error : null,
        retry,
    }
}
