"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
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

const desktopNavLinks = navLinks.filter((link) => link.href !== "/search")

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
        <header className="site-header sticky top-0 z-50">
            <a href="#main-content" className="skip-link">
                Skip to content
            </a>
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-2.5 font-heading text-lg font-medium"
                >
                    <Logo className="size-7 text-on-dark" />
                    <span>Project Sonam</span>
                </Link>

                <nav
                    className="ml-4 hidden items-center md:flex"
                    aria-label="Main navigation"
                >
                    {desktopNavLinks.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className="header-nav-link"
                            aria-current={
                                pathname === href ||
                                (href !== "/" &&
                                    pathname.startsWith(`${href}/`))
                                    ? "page"
                                    : undefined
                            }
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <form
                    onSubmit={handleSearch}
                    className="ml-auto hidden max-w-64 flex-1 items-center sm:flex"
                    role="search"
                >
                    <div className="relative w-full">
                        <Search01Icon
                            className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-on-dark-soft"
                            aria-hidden="true"
                        />
                        <Input
                            type="search"
                            name="q"
                            placeholder="Search books or authors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="header-search pl-9"
                            aria-label="Search books"
                            autoComplete="off"
                        />
                    </div>
                </form>

                <Button
                    asChild
                    variant="ghost"
                    size="icon-lg"
                    className="ml-auto sm:hidden"
                    aria-label="Search books"
                >
                    <Link href="/search">
                        <Search01Icon className="size-5" aria-hidden="true" />
                    </Link>
                </Button>

                <Drawer direction="bottom">
                    <DrawerTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="md:hidden"
                            aria-label="Open navigation menu"
                        >
                            <Menu01Icon className="size-5" aria-hidden="true" />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="site-nav-drawer">
                        <DrawerHeader>
                            <DrawerTitle>Navigation</DrawerTitle>
                        </DrawerHeader>
                        <nav
                            className="flex flex-col gap-2 px-4 pb-6"
                            aria-label="Mobile navigation"
                        >
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <DrawerClose key={href} asChild>
                                    <Button
                                        asChild
                                        variant={
                                            pathname === href ||
                                            (href !== "/" &&
                                                pathname.startsWith(`${href}/`))
                                                ? "secondary"
                                                : "ghost"
                                        }
                                        className="w-full justify-start gap-2"
                                    >
                                        <Link
                                            href={href}
                                            className="mobile-nav-link"
                                            aria-current={
                                                pathname === href ||
                                                (href !== "/" &&
                                                    pathname.startsWith(
                                                        `${href}/`
                                                    ))
                                                    ? "page"
                                                    : undefined
                                            }
                                        >
                                            <Icon
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                            {label}
                                        </Link>
                                    </Button>
                                </DrawerClose>
                            ))}
                        </nav>
                    </DrawerContent>
                </Drawer>
            </div>
        </header>
    )
}
