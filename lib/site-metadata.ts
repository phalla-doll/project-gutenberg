export const siteName = "Project Gutenberg"
export const siteUrl = "https://gutenberg.manthaa.dev"

export const defaultDescription =
    "Browse and search thousands of free ebooks from Project Gutenberg"

export const defaultOgImage = {
    url: "/project-gutenberg-og.png",
    width: 1376,
    height: 768,
    alt: "Project Gutenberg book cover and title artwork",
}

export function getAbsoluteUrl(path: string) {
    return new URL(path, siteUrl).toString()
}
