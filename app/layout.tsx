import { GoogleAnalytics } from "@next/third-parties/google"
import { EB_Garamond, JetBrains_Mono } from "next/font/google"
import Link from "next/link"
import { Header } from "@/components/header"
import { Logo } from "@/components/logo"
import {
    defaultDescription,
    defaultOgImage,
    siteName,
    siteUrl,
} from "@/lib/site-metadata"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import "../public/fonts/fonts.css"

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        template: `%s - ${siteName}`,
        default: siteName,
    },
    description: defaultDescription,
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: siteName,
        description: defaultDescription,
        url: siteUrl,
        siteName,
        locale: "en_US",
        type: "website",
        images: [defaultOgImage],
    },
    twitter: {
        card: "summary_large_image",
        title: siteName,
        description: defaultDescription,
        images: [defaultOgImage.url],
    },
}

export const viewport: Viewport = {
    themeColor: "#352438",
}

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
})

const ebGaramond = EB_Garamond({
    subsets: ["latin"],
    style: ["italic"],
    variable: "--font-garamond",
})

export default function RootLayout({
    children,
    modal,
}: Readonly<{
    children: React.ReactNode
    modal: React.ReactNode
}>) {
    return (
        <html
            lang="en"
            data-scroll-behavior="smooth"
            className={`${jetbrainsMono.variable} ${ebGaramond.variable} font-sans antialiased`}
        >
            <head>
                <link
                    rel="preconnect"
                    href="https://www.gutenberg.org"
                    crossOrigin=""
                />
                <link rel="preconnect" href="https://covers.openlibrary.org" />
            </head>
            <body
                className="flex min-h-svh flex-col bg-background"
                suppressHydrationWarning
            >
                <Header />
                <main id="main-content" className="flex-1">
                    {children}
                </main>
                <footer className="border-t border-border bg-surface-soft py-10 text-muted-foreground">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Logo className="size-6 text-primary" />
                                <span className="font-heading text-lg text-foreground">
                                    Project Sonam
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                Built with data from{" "}
                                <a
                                    href="https://gutendex.com"
                                    className="text-primary underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Gutendex API
                                </a>{" "}
                                - free ebooks, open to all
                            </p>
                            <Link
                                href="/about/disclaimer"
                                className="shrink-0 text-sm text-primary underline underline-offset-4"
                            >
                                About & Disclaimer
                            </Link>
                        </div>
                    </div>
                </footer>
                {modal}
            </body>
            <GoogleAnalytics
                gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!}
            />
        </html>
    )
}
