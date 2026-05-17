import { DM_Sans, Merriweather, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Header } from "@/components/header"
import "./globals.css"

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
      <body className="min-h-svh bg-background">
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <Header />
          <main>{children}</main>
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
