interface PageHeadingProps {
    mark: string
    markLabel: string
    title: string
    description: string
}

export function PageHeading({
    mark,
    markLabel,
    title,
    description,
}: PageHeadingProps) {
    return (
        <div className="mb-10">
            <div className="sign-board inline-flex max-w-full items-center gap-4 py-4 pr-8 pl-7 sm:gap-5 sm:py-[1.125rem] sm:pr-9 sm:pl-8">
                <div
                    aria-hidden="true"
                    className="shrink-0 text-center [text-box:trim-both_cap_alphabetic]"
                >
                    <span className="sign-burn block font-heading text-2xl leading-none tracking-tight sm:text-[1.75rem]">
                        {mark}
                    </span>
                    <span className="sign-burn mt-1 block font-mono text-[0.55rem] tracking-[0.18em] uppercase">
                        {markLabel}
                    </span>
                </div>
                <span
                    aria-hidden="true"
                    className="sign-divider h-9 w-px shrink-0 sm:h-10"
                />
                <h1 className="sign-engrave min-w-0 font-heading text-2xl tracking-tight text-balance [text-box:trim-both_cap_alphabetic] sm:text-3xl md:text-4xl">
                    {title}
                </h1>
            </div>
            <p className="mt-4 font-serif text-lg text-body-text italic">
                {description}
            </p>
        </div>
    )
}
