interface PageHeadingProps {
    title: string
    description: string
}

export function PageHeading({ title, description }: PageHeadingProps) {
    return (
        <div className="page-heading">
            <h1 className="font-heading text-4xl leading-tight font-medium tracking-tight text-balance sm:text-5xl">
                {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {description}
            </p>
        </div>
    )
}
