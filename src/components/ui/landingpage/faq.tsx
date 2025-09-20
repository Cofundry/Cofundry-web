"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export type FAQItem = {
    id?: string
    q: string
    a: string
}

type FAQSectionProps = {
    // Header
    eyebrow?: string
    title?: string
    highlight?: string // word to gradient-highlight in the title (defaults to "Questions")
    description?: string

    // Data & behavior
    items: FAQItem[]
    initiallyVisible?: number
    multipleOpen?: boolean
    openFirst?: boolean

    // CTAs
    showMoreLabel?: string
    ctaHref?: string
    ctaLabel?: string

    className?: string
}

export function FAQSection({
    eyebrow = "FAQ",
    title = "Frequently Asked Questions",
    highlight = "Questions",
    description = "Find answers to common questions and learn how Cofundry helps you collaborate on projects.",
    items,
    initiallyVisible = 6,
    multipleOpen = true,
    openFirst = true,
    showMoreLabel = "Show more",
    ctaHref = "/faq",
    ctaLabel = "Visit Our Help Center",
    className = "",
}: FAQSectionProps) {
    const [visibleCount, setVisibleCount] = React.useState(Math.min(initiallyVisible, items.length))
    const showAll = visibleCount >= items.length
    const visibleItems = items.slice(0, visibleCount)

    // default open: first item
    const firstVal = visibleItems[0]?.id ?? (visibleItems.length ? "faq-0" : undefined)
    const defaultValue =
        openFirst && firstVal
            ? multipleOpen
                ? [firstVal]
                : firstVal
            : undefined

    // SEO JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({
            "@type": "Question",
            name: it.q,
            acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
    }

    // split title to apply gradient on `highlight`
    const parts = title.split(new RegExp(`(${escapeRegExp(highlight)})`, "i"))

    return (
        <section
            id="faq"
            className={`py-20 sm:py-24 bg-gradient-to-b from-background to-primary/5 ${className}`}
        >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    {eyebrow && (
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {eyebrow}
                        </span>
                    )}

                    <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
                        {parts.map((p, i) =>
                            p.toLowerCase() === highlight.toLowerCase() ? (
                                <span
                                    key={i}
                                    className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent"
                                >
                                    {p}
                                </span>
                            ) : (
                                <span key={i}>{p}</span>
                            )
                        )}
                    </h2>

                    {description && (
                        <p className="mt-3 text-muted-foreground text-base sm:text-lg leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {/* Card */}
                <div className="mt-10 sm:mt-12">
                    <div className="mx-auto  rounded-2xl  bg-background ">
                        <Accordion
                            type={multipleOpen ? "multiple" : "single"}
                            collapsible
                            defaultValue={defaultValue as any}
                            className="divide-y"
                        >
                            {visibleItems.map((item, idx) => {
                                const value = item.id ?? `faq-${idx}`
                                return (
                                    <AccordionItem key={value} value={value} className="px-4 sm:px-6">
                                        <AccordionTrigger
                                            className="py-4 text-left text-base sm:text-lg font-semibold hover:no-underline
                                 transition-colors data-[state=open]:text-primary"
                                        >
                                            {item.q}
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-5 -mt-1 text-sm sm:text-base text-muted-foreground leading-relaxed">
                                            {item.a}
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </div>

                    {/* Controls under list */}
                    <div className="mt-6 flex justify-center">
                        {!showAll && (
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => setVisibleCount(items.length)}
                            >
                                {showMoreLabel}
                            </Button>
                        )}
                    </div>

                    {/* CTA block */}
                    {(ctaHref || ctaLabel) && (
                        <div className="mt-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                Still have questions? Our team is ready to help.
                            </p>
                            <div className="mt-4">
                                <Button asChild className="rounded-full">
                                    <Link href={ctaHref}>
                                        {ctaLabel}
                                        <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </section>
    )
}

/* ---------- utils ---------- */
function escapeRegExp(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
