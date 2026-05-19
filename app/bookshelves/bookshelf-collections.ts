export interface BookshelfCollection {
    heading: string
    pattern: RegExp
}

export const BOOKSHELF_COLLECTIONS: BookshelfCollection[] = [
    {
        heading: "Animals & Nature",
        pattern:
            /^(Animals?|Animals?-Domestic|Animals?-Wild|Bird|Botany|Ecology|Forestry|Horticulture|Natural History|Zoology|Mycology|Microbiology|Microscopy|Camping|Nature)/i,
    },
    {
        heading: "Children & Young Readers",
        pattern:
            /^(Children|Barnavännen|Dew Drops|Golden Days|Little Folks|Nursery|Our Young Folks|St\. Nicholas|School Stories)/i,
    },
    {
        heading: "Fiction — Genre",
        pattern:
            /^(Adventure|Crime Fiction|Detective Fiction|Erotic Fiction|Fantasy|General Fiction|Gothic Fiction|Historical Fiction|Horror|Humor|Mystery Fiction|Precursors of Science Fiction|Romantic Fiction|Science Fiction|Short Stories|Western)/i,
    },
    {
        heading: "History & War",
        pattern:
            /^(American Revolutionary War|Boer War|English Civil War|Napoleonic Era|Spanish American War|US Civil War|World War|Pirates)/i,
    },
    {
        heading: "Countries & Regions",
        pattern:
            /^(Africa|Argentina|Australia|Bulgaria|Canada|Czech|Egypt|France|Germany|Greece|India|Italy|New Zealand|Norway|South Africa|South America|United Kingdom|United States)/i,
    },
    {
        heading: "Religion & Mythology",
        pattern:
            /^(Atheism|Bahá'í Faith|Buddhism|Christianity|Hinduism|Islam|Judaism|Latter Day|Mythology|Paganism|Witchcraft|Arthurian Legends|Folklore)/i,
    },
    {
        heading: "Science & Mathematics",
        pattern:
            /^(Astronomy|Biology|Chemistry|Geology|Mathematics|Physics|Physiology|Science(?! Fiction)|Scientific American)/i,
    },
    {
        heading: "Arts, Music & Architecture",
        pattern:
            /^(Art|Architecture|Architecture|Music|Opera|Photography|Illustrators|Masterpieces in Colour|Mediæval Town)/i,
    },
    {
        heading: "Periodicals & Magazines",
        pattern:
            /^(Ainslee's|Armour's Monthly|Astounding Stories|Bird-Lore|Blackwood's|Bulletin de Lille|Celtic Magazine|Chambers's|Continental Monthly|Current History|Donahoe's|Esperantist|Garden and Forest|Godey's|Graham's|Harper's|L'Illustration|Lippincott's|McClure's|Mother Earth|Notes and Queries|Punch|Punchinello|Poetry, A Magazine|Popular Science Monthly|Prairie Farmer|Scribner's|The Aldine|The American Architect|The American Bee Journal|The American Journal|The American Missionary|The American Quarterly|The Arena|The Argosy|The Atlantic Monthly|The Baptist|The Bay State|The Botanical|The Brochure|The Catholic World|The Christian|The Church of England|The Contemporary Review|The Economist|The Galaxy|The Girls Own|The Great Round World|The Haslemere|The Idler|The Illustrated|The International Magazine|The Irish|The Journal of Negro|The Knickerbocker|The Mayflower|The Menorah|The Mentor|The Mirror|The National Preacher|The North American|The Nursery|The Philatelic|The Scrap Book|The Speaker|The Stars and Stripes|The Strand|The Unpopular|The Writer|The Yellow Book|De Aarde|Journal of Entomology)/i,
    },
    {
        heading: "Law, Politics & Society",
        pattern:
            /^(Anarchism|British Law|Canon Law|United States Law|Noteworthy Trials|Racism|Slavery|Sociology|Suffrage|Transportation|Politics|Psychology|Education)/i,
    },
    {
        heading: "Literature, Language & Philosophy",
        pattern:
            /^(Bestsellers|Best Books|Bibliomania|Biographies|Children's Book Series|Christmas|Classical Antiquity|Contemporary Reviews|Early English Text Society|Esperanto|Language Education|Love|One Act Plays|Philosophy|Plays|Poetry|Reference|Banned Books)/i,
    },
    {
        heading: "Technology, Crafts & Lifestyle",
        pattern:
            /^(Crafts|Cookbooks|Cooking|Engineering|Manufacturing|Technology|Woodwork|Scouts|Travel|Women's Travel|Movie Books)/i,
    },
    {
        heading: "French Language",
        pattern: /^French - /i,
    },
    {
        heading: "German Language",
        pattern: /^German(?! Language)/i,
    },
    {
        heading: "Italian Language",
        pattern: /^Italian - /i,
    },
    {
        heading: "Portuguese Language",
        pattern: /^Portuguese - /i,
    },
]

export function classifyBookshelf(name: string): {
    heading: string
    index: number
} {
    for (let i = 0; i < BOOKSHELF_COLLECTIONS.length; i++) {
        if (BOOKSHELF_COLLECTIONS[i].pattern.test(name)) {
            return { heading: BOOKSHELF_COLLECTIONS[i].heading, index: i }
        }
    }
    return { heading: "Other", index: BOOKSHELF_COLLECTIONS.length }
}
