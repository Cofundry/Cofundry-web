// D:\Cofundry\Cofundry-web\src\app\projects\[id]\page.tsx
import Link from "next/link"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar1 } from "@/components/ui/landingpage/navbar"
import Footer7 from "@/components/ui/landingpage/footer"
import {
    Layers, Gauge, MapPin, DollarSign, CalendarDays, Tag, Users, User, Code2,
    Briefcase, Clock, Globe, ShieldCheck, Sparkles
} from "lucide-react"

/* -------------------- utils: base url + formatting -------------------- */
async function getBaseUrl() {
    const env = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    if (env) return env.startsWith("http") ? env : `https://${env}`

    const h = await headers()
    const host = h.get("x-forwarded-host") ?? h.get("host")
    const proto = h.get("x-forwarded-proto") ?? "http"
    return host ? `${proto}://${host}` : "http://localhost:3000"
}


function formatDateUTC(value?: string | Date | null) {
    if (!value) return "—"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "—"
    return d.toISOString().slice(0, 10) // YYYY-MM-DD (hydration-safe)
}

function formatNumberPlain(n: number) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/** Budget can be string/number/object — render safely */
function formatBudget(b: any): string | null {
    if (b == null || b === "") return null
    if (typeof b === "string") return b
    if (typeof b === "number") return `$${formatNumberPlain(b)}`
    if (typeof b === "object") {
        const cur = b.currency ?? "$"
        if (b.min != null && b.max != null) return `${cur}${formatNumberPlain(+b.min)}–${cur}${formatNumberPlain(+b.max)}`
        if (b.amount != null) return `${cur}${formatNumberPlain(+b.amount)}`
        try { return JSON.stringify(b) } catch { return String(b) }
    }
    return String(b)
}

function isNonEmptyArray(v: unknown): v is any[] {
    return Array.isArray(v) && v.length > 0
}

function safeText(v: any, fallback = "—") {
    if (v == null) return fallback
    const s = String(v).trim()
    return s.length ? s : fallback
}

/* ----------------------------- data fetch ----------------------------- */
/* ----------------------------- data fetch ----------------------------- */
async function getProject(id: string) {
    const base = await getBaseUrl()

    const h = await headers()
    const cookie = h.get("cookie") ?? undefined
    const authorization = h.get("authorization") ?? undefined

    const res = await fetch(`${base}/api/projects/${encodeURIComponent(id)}`, {
        cache: "no-store",
        headers: {
            ...(cookie ? { cookie } : {}),
            ...(authorization ? { authorization } : {}),
        },
    })

    if (!res.ok) return null
    try {
        return await res.json()
    } catch {
        return null
    }
}

/* ------------------------------ page ------------------------------ */
export default async function ProjectDetailsPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const data = await getProject(id);
    if (!data) notFound();

    // API returns raw project doc
    const project = data as any

    const title = project?.title ?? project?.name ?? "Project"
    const description = project?.description ?? project?.summary ?? "No description provided."
    const category = project?.category
    const difficulty = project?.difficulty
    const location = project?.location
    const budget = formatBudget(project?.budget)
    const deadline = project?.deadline ? formatDateUTC(project?.deadline) : null
    const updated = formatDateUTC(project?.updatedAt || project?.createdAt)
    const created = formatDateUTC(project?.createdAt)
    const status = project?.status ?? "open"

    const logo = project?.logo as string | undefined
    const tags = isNonEmptyArray(project?.tags) ? project.tags as string[] : []
    const tech = isNonEmptyArray(project?.techStack) ? project.techStack as string[] : []

    const requirements = safeText(project?.requirements, "")
    const teamSize = project?.teamSize
    const teamComposition = project?.teamComposition

    const devReq = safeText(project?.developerRequirements, "")
    const designReq = safeText(project?.designerRequirements, "")
    const mktReq = safeText(project?.marketerRequirements, "")
    const bizReq = safeText(project?.commercialRequirements, "")

    const authorName = project?.authorName ?? "Anonymous User"
    const authorEmail = project?.authorEmail ?? ""
    const authorAvatar = project?.authorAvatar ?? ""

    const contactWebsite = project?.contactInfo?.website ?? ""
    const contactDiscord = project?.contactInfo?.discord ?? ""
    const contactTwitter = project?.contactInfo?.twitter ?? ""

    const attachments = isNonEmptyArray(project?.attachments) ? project.attachments as any[] : []

    return (
        <main className="min-h-screen bg-background">
            {/* NAV */}
            <Navbar1 />

            {/* HERO */}
            <section className="relative overflow-hidden">
                {/* bg grid + glows */}
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div
                        className="absolute inset-0 opacity-[0.22] dark:opacity-40"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                        }}
                    />
                    <div className="absolute -top-40 -left-20 h-[36rem] w-[36rem] rounded-full blur-3xl"
                        style={{ background: "radial-gradient(closest-side, hsl(var(--primary)) 0%, transparent 70%)", opacity: .18 }} />
                    <div className="absolute -bottom-48 -right-10 h-[34rem] w-[34rem] rounded-full blur-3xl"
                        style={{ background: "radial-gradient(closest-side, hsl(var(--primary)) 0%, transparent 70%)", opacity: .12 }} />
                </div>

                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
                    <div className="flex items-center gap-4">
                        <div className="relative size-16 shrink-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur flex items-center justify-center">
                            {logo ? (
                                // using <img> to avoid remotePatterns config requirements
                                <img src={logo} alt={title} className="h-12 w-12 object-contain" />
                            ) : (
                                <Sparkles className="size-6 opacity-80" />
                            )}
                            <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_120px_rgba(255,255,255,.08)_inset]" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                {category && (
                                    <Badge variant="secondary" className="rounded-full">
                                        <Layers className="mr-1 size-3.5" /> {category}
                                    </Badge>
                                )}
                                {difficulty && (
                                    <Badge variant="secondary" className="rounded-full">
                                        <Gauge className="mr-1 size-3.5" /> {difficulty}
                                    </Badge>
                                )}
                                {location && (
                                    <Badge variant="secondary" className="rounded-full">
                                        <MapPin className="mr-1 size-3.5" /> {location}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="rounded-full border-white/20">
                                    <ShieldCheck className="mr-1 size-3.5" /> {status}
                                </Badge>
                            </div>
                            <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
                            <p className="mt-2 text-sm text-muted-foreground">Created {created} · Updated {updated}</p>
                        </div>

                        <div className="ml-auto hidden sm:flex items-center gap-3">
                            <Button asChild variant="ghost" className="rounded-full">
                                <Link href="/projects">Back to all</Link>
                            </Button>
                            <Button asChild className="rounded-full">
                                <Link href="/login">Apply Now</Link>
                            </Button>
                        </div>
                    </div>

                    {isNonEmptyArray(tags) && (
                        <div className="mt-5 flex flex-wrap gap-2">
                            {tags.map((t, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                                    <Tag className="size-3.5 opacity-80" /> {t}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* MAIN */}
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Overview */}
                        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] p-6 backdrop-blur">
                            <h2 className="text-lg font-semibold">Overview</h2>
                            <p className="mt-2 text-muted-foreground whitespace-pre-line">{description}</p>
                        </section>

                        {/* Requirements */}
                        {(requirements || devReq || designReq || mktReq || bizReq) && (
                            <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] p-6 backdrop-blur space-y-5">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="size-4 opacity-80" />
                                    <h3 className="text-base sm:text-lg font-semibold">Requirements</h3>
                                </div>

                                {requirements && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium text-foreground/90">General</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{requirements}</p>
                                    </div>
                                )}

                                {devReq && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium flex items-center gap-2"><Code2 className="size-4" /> Developer</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{devReq}</p>
                                    </div>
                                )}

                                {designReq && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium flex items-center gap-2"><Sparkles className="size-4" /> Designer</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{designReq}</p>
                                    </div>
                                )}

                                {mktReq && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium flex items-center gap-2"><Globe className="size-4" /> Marketing</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{mktReq}</p>
                                    </div>
                                )}

                                {bizReq && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium flex items-center gap-2"><DollarSign className="size-4" /> Commercial</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{bizReq}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Tech stack */}
                        {isNonEmptyArray(tech) && (
                            <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] p-6 backdrop-blur">
                                <div className="flex items-center gap-2 mb-3">
                                    <Code2 className="size-4 opacity-80" />
                                    <h3 className="text-base sm:text-lg font-semibold">Tech stack</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tech.map((t, i) => (
                                        <span key={i} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Attachments */}
                        {isNonEmptyArray(attachments) && (
                            <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] p-6 backdrop-blur">
                                <div className="flex items-center gap-2 mb-3">
                                    <PaperclipIcon />
                                    <h3 className="text-base sm:text-lg font-semibold">Attachments</h3>
                                </div>
                                <ul className="space-y-2 text-sm">
                                    {attachments.map((att, i) => {
                                        // support string URLs or { url, name }
                                        const url = typeof att === "string" ? att : att?.url
                                        const name = (typeof att === "object" && att?.name) ? String(att.name) : undefined
                                        return url ? (
                                            <li key={i} className="truncate">
                                                <Link
                                                    href={url}
                                                    target="_blank"
                                                    className="underline underline-offset-4 hover:no-underline"
                                                >
                                                    {name ?? url}
                                                </Link>
                                            </li>
                                        ) : null
                                    })}
                                </ul>
                            </section>
                        )}
                    </div>

                    {/* RIGHT / SIDEBAR */}
                    <aside className="lg:sticky lg:top-20 space-y-6 h-fit">
                        {/* Quick facts */}
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] p-5 backdrop-blur">
                            <h3 className="text-lg font-semibold">Details</h3>
                            <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                                {category && (
                                    <Row icon={<Layers className="size-4 opacity-80" />} label="Category" value={category} />
                                )}
                                {difficulty && (
                                    <Row icon={<Gauge className="size-4 opacity-80" />} label="Difficulty" value={difficulty} />
                                )}
                                {location && (
                                    <Row icon={<MapPin className="size-4 opacity-80" />} label="Location" value={location} />
                                )}
                                {budget && (
                                    <Row icon={<DollarSign className="size-4 opacity-80" />} label="Budget" value={budget} />
                                )}
                                {deadline && (
                                    <Row icon={<CalendarDays className="size-4 opacity-80" />} label="Deadline" value={deadline} />
                                )}
                                {teamSize != null && (
                                    <Row icon={<Users className="size-4 opacity-80" />} label="Team size" value={String(teamSize)} />
                                )}
                                {teamComposition && (
                                    <Row icon={<User className="size-4 opacity-80" />} label="Team" value={String(teamComposition)} />
                                )}
                                <Row icon={<Clock className="size-4 opacity-80" />} label="Status" value={String(status)} />
                            </div>
                            <div className="mt-5 grid grid-cols-2 gap-2">
                                <Button asChild className="rounded-full">
                                    <Link href="/login">Apply Now</Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-full">
                                    <Link href="/projects">Back</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Author */}
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] p-5 backdrop-blur">
                            <h3 className="text-lg font-semibold">Posted by</h3>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="relative size-12 rounded-full border border-white/10 bg-white/5 overflow-hidden">
                                    {authorAvatar ? (
                                        <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full grid place-items-center text-xs text-muted-foreground">
                                            {authorName?.slice(0, 2)?.toUpperCase() ?? "AU"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium">{authorName}</div>
                                    <div className="text-xs text-muted-foreground">{authorEmail || "—"}</div>
                                </div>
                            </div>

                            {(authorEmail || contactWebsite || contactDiscord || contactTwitter) && (
                                <div className="mt-4 grid gap-2">
                                    {authorEmail && (
                                        <Button asChild variant="secondary" className="rounded-full w-full">
                                            <Link href={`mailto:${authorEmail}`}>Contact via Email</Link>
                                        </Button>
                                    )}
                                    {contactWebsite && (
                                        <Button asChild variant="ghost" className="rounded-full w-full">
                                            <Link href={contactWebsite} target="_blank" rel="noopener noreferrer">Website</Link>
                                        </Button>
                                    )}
                                    {contactDiscord && (
                                        <Button asChild variant="ghost" className="rounded-full w-full">
                                            <Link href={contactDiscord} target="_blank" rel="noopener noreferrer">Discord</Link>
                                        </Button>
                                    )}
                                    {contactTwitter && (
                                        <Button asChild variant="ghost" className="rounded-full w-full">
                                            <Link href={contactTwitter} target="_blank" rel="noopener noreferrer">Twitter / X</Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 flex sm:hidden gap-3">
                    <Button asChild className="flex-1 rounded-full">
                        <Link href="/login">Apply Now</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 rounded-full">
                        <Link href="/projects">Back to all</Link>
                    </Button>
                </div>
            </div>

            {/* FOOTER */}
            <Footer7 />
        </main>
    )
}

/* -------------------------- tiny helpers -------------------------- */

// Small row for sidebar details
function Row({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-start gap-2">
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1">
                <div className="text-foreground text-xs">{label}</div>
                <div className="text-sm">{safeText(value)}</div>
            </div>
        </div>
    )
}

// Minimal paperclip icon (avoids adding another lib)
function PaperclipIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4 opacity-80" aria-hidden="true">
            <path d="M21.44 11.05 12 20.5a6 6 0 1 1-8.49-8.49L12.5 3.5a4 4 0 1 1 5.66 5.66L9.76 17.56a2 2 0 1 1-2.83-2.83L14.5 7.17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
