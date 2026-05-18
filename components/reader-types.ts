export interface ReaderTocItem {
    id: string
    title: string
}

export interface ReaderBlock {
    id: string
    type: "paragraph" | "pre"
    text: string
}

export interface ReaderSection {
    id: string
    title: string
    blocks: ReaderBlock[]
    includeInToc: boolean
}
