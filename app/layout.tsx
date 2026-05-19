import { GoogleAnalytics } from "@next/third-parties/google"
import { JetBrains_Mono } from "next/font/google"
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
    themeColor: "#faf9f5",
}

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="en"
            className={`${jetbrainsMono.variable} font-sans antialiased`}
        >
            <head>
                <link rel="preconnect" href="https://cdn.fontshare.com" />
                <link
                    href="https://api.fontshare.com/v2/css?f[]=familjen-grotesk&f[]=satoshi&display=swap"
                    rel="stylesheet"
                />
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
                <footer className="bg-surface-dark py-16 text-on-dark-soft">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex items-center gap-2">
                                <Logo className="size-6 text-on-dark" />
                                <span className="font-heading text-lg text-on-dark">
                                    Project Sonam
                                </span>
                            </div>
                            <p className="text-sm">
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
                                className="text-sm text-on-dark underline underline-offset-4 transition-colors hover:text-primary"
                            >
                                About & Disclaimer
                            </Link>
                        </div>
                    </div>
                </footer>
            </body>
            <GoogleAnalytics
                gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!}
            />
        </html>
    )
}
