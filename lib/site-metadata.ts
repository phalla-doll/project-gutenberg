export const siteName = "Project Sonam"
export const siteUrl = "https://sonam.manthaa.dev"

export const defaultDescription =
    "Browse and search thousands of free ebooks with Project Sonam"

export const defaultOgImage = {
    url: "/project-sonam-og.png",
    width: 1376,
    height: 768,
    alt: "Project Sonam book cover and title artwork",
}

export function getAbsoluteUrl(path: string) {
    return new URL(path, siteUrl).toString()
}
