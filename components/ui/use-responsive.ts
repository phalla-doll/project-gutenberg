"use client"

import { useEffect, useState } from "react"

interface ResponsiveProp<T> {
    sm?: T
    md?: T
    lg?: T
    xl?: T
}

const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
}

function resolveResponsiveValue<T>(
    value: T | ResponsiveProp<T>,
    useViewport = true
): T | undefined {
    if (typeof value !== "object" || value === null) {
        return value
    }

    const responsiveValue = value as ResponsiveProp<T>

    if (!useViewport || typeof window === "undefined") {
        return (
            responsiveValue.sm ??
            responsiveValue.md ??
            responsiveValue.lg ??
            responsiveValue.xl
        )
    }

    if (
        window.matchMedia(`(min-width: ${breakpoints.xl}px)`).matches &&
        responsiveValue.xl !== undefined
    ) {
        return responsiveValue.xl
    }

    if (
        window.matchMedia(`(min-width: ${breakpoints.lg}px)`).matches &&
        responsiveValue.lg !== undefined
    ) {
        return responsiveValue.lg
    }

    if (
        window.matchMedia(`(min-width: ${breakpoints.md}px)`).matches &&
        responsiveValue.md !== undefined
    ) {
        return responsiveValue.md
    }

    return (
        responsiveValue.sm ??
        responsiveValue.md ??
        responsiveValue.lg ??
        responsiveValue.xl
    )
}

export function useResponsive<T>(value: T | ResponsiveProp<T>): T | undefined {
    const [resolvedValue, setResolvedValue] = useState(() =>
        resolveResponsiveValue(value, false)
    )

    useEffect(() => {
        const updateValue = () => {
            setResolvedValue(resolveResponsiveValue(value))
        }

        updateValue()

        const mediaQueries = Object.values(breakpoints).map((breakpoint) =>
            window.matchMedia(`(min-width: ${breakpoint}px)`)
        )

        mediaQueries.forEach((mediaQuery) => {
            mediaQuery.addEventListener("change", updateValue)
        })

        return () => {
            mediaQueries.forEach((mediaQuery) => {
                mediaQuery.removeEventListener("change", updateValue)
            })
        }
    }, [value])

    return resolvedValue
}
