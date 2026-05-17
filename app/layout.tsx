import { JetBrains_Mono } from "next/font/google"
import { Header } from "@/components/header"
import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
    title: {
        template: "%s - Project Gutenberg",
        default: "Project Gutenberg",
    },
    description:
        "Browse and search thousands of free ebooks from Project Gutenberg",
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
                    href="https://api.fontshare.com/v2/css?f[]=boska&f[]=satoshi&display=swap"
                    rel="stylesheet"
                />
                <link rel="preconnect" href="https://gutendex.com" />
                <link
                    rel="preconnect"
                    href="https://www.gutenberg.org"
                    crossOrigin=""
                />
                <link rel="preconnect" href="https://covers.openlibrary.org" />
            </head>
            <body className="flex min-h-svh flex-col bg-background">
                <Header />
                <main id="main-content" className="flex-1">{children}</main>
                <footer className="bg-surface-dark py-16 text-on-dark-soft">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <p className="font-heading text-lg text-on-dark">
                                Project Gutenberg
                            </p>
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
                                &mdash; Free ebooks, open to all
                            </p>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    )
}
