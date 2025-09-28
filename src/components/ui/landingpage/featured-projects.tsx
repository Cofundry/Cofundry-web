// D:\Cofundry\Cofundry-web\src\components\ui\landingpage\featured-projects.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowRight } from "lucide-react"
import type { Project } from "@/lib/models/Project"

type ProjectsResponse = {
    projects: Project[]
}

type Props = {
    title?: string
    subtitle?: string
    limit?: number
    sort?: "likes_desc" | "latest"
    className?: string
    ctaHref?: string
    ctaLabel?: string
}

/** ---- ID helpers: handle Mongo's {_id: {$oid}} / ObjectId / slug / id ---- */
function getProjectId(p: any): string {
    const raw = p?.slug ?? p?.id ?? p?._id
    if (!raw) return ""
    if (typeof raw === "string") return raw
    if (typeof raw === "object") return raw?.$oid ?? raw?.toString?.() ?? ""
    return String(raw)
}

// Fallback slugify used when an id is missing
function slugify(text: string) {
    return String(text || "project").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function getProjectKey(p: any): string {
    return getProjectId(p) || `${p?.title ?? p?.name ?? "project"}-${p?.updatedAt ?? Math.random()}`
}

/** ---- Date helper ---- */
function formatDate(value?: string) {
    if (!value) return "recently"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "recently"
    return d.toLocaleDateString()
}

export function FeaturedProjects({
    title = "Popular Projects",
    subtitle = "A quick taste of what’s trending. Browse all to use filters.",
    limit = 6,
    sort = "likes_desc",
    className = "",
    ctaHref = "/projects",
    ctaLabel = "Browse all projects",
}: Props) {
    const [projects, setProjects] = React.useState<Project[]>([])
    const [loading, setLoading] = React.useState<boolean>(true)

    React.useEffect(() => {
        let isMounted = true
            ; (async () => {
                try {
                    const res = await fetch(`/api/projects?limit=${limit}&sort=${sort}`, { cache: "no-store" })
                    if (!res.ok) throw new Error("Failed to load")
                    const data: ProjectsResponse = await res.json()
                    let list = data.projects ?? []
                    if (sort === "likes_desc") list = [...list].sort((a: any, b: any) => (b?.likes ?? 0) - (a?.likes ?? 0))
                    if (isMounted) setProjects(list.slice(0, limit))
                } catch {
                    if (isMounted) setProjects([])
                } finally {
                    if (isMounted) setLoading(false)
                }
            })()
        return () => {
            isMounted = false
        }
    }, [limit, sort])

    return (
        <section
            className={`relative py-20 sm:py-24 ${className}`}
            aria-label="Featured projects"
        >
            {/* subtle grid + glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.18] dark:opacity-30"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />
                <div className="absolute -top-28 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-3xl"
                    style={{ background: "radial-gradient(closest-side, hsl(var(--primary)) 0%, transparent 70%)", opacity: .22 }} />
            </div>

            <div className="container mx-auto px-9">
                {/* Header */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_12px_hsl(var(--primary))]" />
                            Featured
                        </div>
                        <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
                        {subtitle && <p className="mt-2 text-muted-foreground sm:text-lg">{subtitle}</p>}
                    </div>
                    {ctaHref && (
                        <Button asChild className="rounded-full">
                            <Link href={ctaHref}>
                                {ctaLabel}
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" aria-label="Loading">
                        {[...Array(limit)].map((_, i) => (
                            <div
                                key={i}
                                className="h-72 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[.05] animate-pulse"
                            />
                        ))}
                    </div>
                ) : projects.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {projects.map((project) => (
                            <CardPreview key={getProjectKey(project)} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-4">We’ll show the most liked ones here.</p>
                        {ctaHref && (
                            <Button asChild variant="outline" className="rounded-full">
                                <Link href={ctaHref}>Go to all projects</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}


/* --- Futuristic compact card (logo-first) --- */
function CardPreview({ project }: { project: any }) {
    const id = getProjectId(project) || slugify(project?.title ?? project?.name ?? 'project')
    const title = project?.title ?? project?.name ?? "Untitled project"
    const desc = project?.shortDescription ?? project?.summary ?? project?.description ?? ""
    const category = project?.category
    const difficulty = project?.difficulty
    const location = project?.location
    const likes = project?.likes ?? 0

    // LOGO fields you might have from your API
    const logoSrc =
        project?.logoUrl ??
        project?.logo ??
        project?.brand?.logo ??
        project?.avatar ??
        ""

    return (
        <article className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] p-4 shadow-[0_8px_30px_rgba(0,0,0,.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,.18)]">
            {/* Glow frame */}
            <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-90"
                style={{ background: "conic-gradient(from 0deg at 50% 50%, transparent, hsl(var(--primary)/.25), transparent)" }}
            />

            {/* Logo tile */}
            <div className="relative flex items-center gap-3">
                <LogoMark src={logoSrc} name={title} size={56} />

                <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-tight line-clamp-1">{title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{desc}</p>
                </div>

                {/* Likes pill */}
                {!!likes && (
                    <div className="absolute right-0 top-0 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[10px] backdrop-blur">
                        <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-90"><path fill="currentColor" d="M12.1 21.35l-1.1-1C5.14 15.24 2 12.39 2 8.99A4.99 4.99 0 0 1 7 4a5.43 5.43 0 0 1 5 3.09A5.43 5.43 0 0 1 17 4a4.99 4.99 0 0 1 5 4.99c0 3.4-3.14 6.25-8.9 11.36z" /></svg>
                        {likes}
                    </div>
                )}
            </div>

            {/* Chips */}
            <div className="mt-4 flex flex-wrap gap-2">
                {category && <Badge variant="secondary" className="rounded-full">{category}</Badge>}
                {difficulty && <Badge variant="outline" className="rounded-full border-dashed">{difficulty}</Badge>}
                {location && <Badge variant="secondary" className="rounded-full">{location}</Badge>}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    Updated {formatDate(project?.updatedAt || project?.createdAt)}
                </span>
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="secondary" className="rounded-full">
                        <Link href={`/projects/${encodeURIComponent(id)}`}>Details</Link>
                    </Button>
                    <Button size="sm" className="rounded-full" asChild>
                        <Link href="/login">Apply</Link>
                    </Button>
                </div>
            </div>
        </article>
    )
}

/* --- Logo mark with initials fallback + auto gradient --- */
function LogoMark({ src, name, size = 56 }: { src?: string; name: string; size?: number }) {
    const initials = getInitials(name)
    const gradient = getGradientFromString(name)
    return (
        <div
            className="relative shrink-0 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ width: size, height: size }}
        >
            <div className="absolute -inset-[2px] rounded-[14px] opacity-60 blur-md"
                style={{ background: gradient }} />
            <div className="relative flex h-full w-full items-center justify-center rounded-xl overflow-hidden">
                {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={src}
                        alt={`${name} logo`}
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                    />
                ) : (
                    <span className="text-sm font-semibold">
                        {initials}
                    </span>
                )}
            </div>
        </div>
    )
}

/* helpers for initials + gradient */
function getInitials(name?: string) {
    if (!name) return "??"
    const parts = String(name).trim().split(/\s+/).slice(0, 2)
    return parts.map(p => p[0]?.toUpperCase() ?? "").join("") || "??"
}

function getGradientFromString(seed: string) {
    const h1 = hashH(seed) % 360
    const h2 = (h1 + 60) % 360
    return `conic-gradient(from 180deg at 50% 50%, hsl(${h1} 70% 55% / .5), hsl(${h2} 70% 55% / .5), transparent 70%)`
}

function hashH(str: string) {
    let h = 0
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
    return Math.abs(h)
}
