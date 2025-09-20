"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"

export function BackToTop({ threshold = 200 }: { threshold?: number }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > threshold)
        onScroll() // run once on mount to set initial state
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [threshold])

    return (
        <button
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            // visibility + motion
            className={[
                "fixed z-40 bottom-[calc(theme(spacing.6)+env(safe-area-inset-bottom))] right-6",
                "inline-flex h-11 w-11 items-center justify-center rounded-full",
                "transition-all duration-300",
                visible
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none",
                // always-visible styling (works on white + dark)
                "bg-white/90 text-zinc-900 ring-1 ring-black/10 shadow-lg",
                "hover:bg-white dark:hover:bg-zinc-800",
                "dark:bg-zinc-900/90 dark:text-white dark:ring-white/10",
            ].join(" ")}
        >
            <ChevronUp className="size-5" />
        </button>
    )
}
