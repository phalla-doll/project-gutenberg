"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet"
import { Logo } from "@/components/logo"
import {
    Home01Icon,
    Menu01Icon,
    Search01Icon,
    LibraryIcon,
    Bookshelf01Icon,
} from "hugeicons-react"

const navLinks = [
    { href: "/", label: "Home", icon: Home01Icon },
    { href: "/browse", label: "Browse", icon: LibraryIcon },
    { href: "/bookshelves", label: "Reading Lists", icon: Bookshelf01Icon },
    { href: "/search", label: "Search", icon: Search01Icon },
]

export function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery("")
        }
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-heading text-lg"
                >
                    <Logo className="size-6 text-primary" />
                    <span className="hidden sm:inline">Project Sonam</span>
                    <span className="sm:hidden">PS</span>
                </Link>

                <nav
                    className="hidden items-center gap-1 md:flex"
                    aria-label="Main navigation"
                >
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href}>
                            <Button
                                variant={
                                    pathname === href ? "secondary" : "ghost"
                                }
                                size="sm"
                                className="gap-1.5"
                            >
                                <Icon className="size-4" aria-hidden="true" />
                                {label}
                            </Button>
                        </Link>
                    ))}
                </nav>

                <form
                    onSubmit={handleSearch}
                    className="ml-auto flex max-w-sm flex-1 items-center"
                    role="search"
                >
                    <div className="relative w-full">
                        <Search01Icon
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <Input
                            type="search"
                            name="q"
                            placeholder="Search books..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                            aria-label="Search books"
                            autoComplete="off"
                        />
                    </div>
                </form>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            aria-label="Open navigation menu"
                        >
                            <Menu01Icon className="size-5" aria-hidden="true" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetTitle>Navigation</SheetTitle>
                        <nav
                            className="mt-6 flex flex-col gap-2"
                            aria-label="Mobile navigation"
                        >
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link key={href} href={href}>
                                    <Button
                                        variant={
                                            pathname === href
                                                ? "secondary"
                                                : "ghost"
                                        }
                                        className="w-full justify-start gap-2"
                                    >
                                        <Icon
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        {label}
                                    </Button>
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
