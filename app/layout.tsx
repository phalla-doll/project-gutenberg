import { DM_Sans, Merriweather, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
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
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#1e1c19" },
    ],
}

const merriweatherHeading = Merriweather({
    subsets: ["latin"],
    variable: "--font-heading",
    weight: ["300", "400", "700", "900"],
})

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
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
            suppressHydrationWarning
            className={`${dmSans.variable} ${merriweatherHeading.variable} ${fontMono.variable} font-sans antialiased`}
        >
            <head>
                <link rel="preconnect" href="https://gutendex.com" />
                <link
                    rel="preconnect"
                    href="https://www.gutenberg.org"
                    crossOrigin=""
                />
                <link
                    rel="preconnect"
                    href="https://covers.openlibrary.org"
                    crossOrigin=""
                />
            </head>
            <body className="min-h-svh bg-background">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    disableTransitionOnChange
                >
                    <Header />
                    <main id="main-content">{children}</main>
                    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <p>
                                Built with data from{" "}
                                <a
                                    href="https://gutendex.com"
                                    className="text-primary underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Gutendex API
                                </a>{" "}
                                &mdash; Project Gutenberg
                            </p>
                        </div>
                    </footer>
                </ThemeProvider>
            </body>
        </html>
    )
}
