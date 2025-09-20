// D:\Cofundry\Cofundry-web\src\app\projects\[id]\page.tsx
import Link from "next/link"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Button } from "@/components/ui/button"
import { Layers, Gauge, MapPin, DollarSign, CalendarDays } from "lucide-react"

/* -------------------- utils: base url + formatting -------------------- */
async function getBaseUrl() {
    // 1) Prefer explicit public app URL
    const env = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    if (env) return env.startsWith("http") ? env : `https://${env}`

    // 2) Derive from request headers (async in your setup)
    const h = await headers()
    const host = h.get("x-forwarded-host") ?? h.get("host")
    const proto = h.get("x-forwarded-proto") ?? "http"
    if (!host) return "http://localhost:3000"
    return `${proto}://${host}`
}

function formatDateUTC(value?: string) {
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

/* ----------------------------- data fetch ----------------------------- */
async function getProject(id: string) {
    const base = await getBaseUrl()
    const url = `${base}/api/projects/${encodeURIComponent(id)}`

    // forward auth (cookies/headers) if your API needs it
    const h = await headers()
    const cookie = h.get("cookie") ?? undefined
    const authorization = h.get("authorization") ?? undefined

    const res = await fetch(url, {
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
export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
    const data = await getProject(params.id)
    if (!data) notFound()
    const project = (data as any).project ?? data // supports both {project} or raw doc

    const title = project?.title ?? project?.name ?? "Project"
    const description = project?.description ?? project?.summary ?? "No description provided."
    const category = project?.category
    const difficulty = project?.difficulty
    const location = project?.location
    const budget = formatBudget(project?.budget)
    const deadline = project?.deadline ? formatDateUTC(project?.deadline) : null
    const updated = formatDateUTC(project?.updatedAt || project?.createdAt)

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
                    <Button asChild variant="outline" className="rounded-full">
                        <Link href="/projects">Back to all</Link>
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Overview */}
                    <section className="md:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] p-5 backdrop-blur">
                        <h2 className="text-lg font-semibold mb-2">Overview</h2>
                        <p className="text-muted-foreground whitespace-pre-line">{description}</p>
                        <p className="mt-6 text-xs text-muted-foreground">Updated {updated}</p>
                    </section>

                    {/* Details */}
                    <aside className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] p-5 backdrop-blur space-y-3">
                        <h3 className="text-lg font-semibold">Details</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            {category && (
                                <div className="flex items-center gap-2">
                                    <Layers className="size-4 opacity-80" />
                                    <span><strong className="text-foreground mr-1">Category:</strong>{category}</span>
                                </div>
                            )}
                            {difficulty && (
                                <div className="flex items-center gap-2">
                                    <Gauge className="size-4 opacity-80" />
                                    <span><strong className="text-foreground mr-1">Difficulty:</strong>{difficulty}</span>
                                </div>
                            )}
                            {location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-4 opacity-80" />
                                    <span><strong className="text-foreground mr-1">Location:</strong>{location}</span>
                                </div>
                            )}
                            {budget && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="size-4 opacity-80" />
                                    <span><strong className="text-foreground mr-1">Budget:</strong>{budget}</span>
                                </div>
                            )}
                            {deadline && (
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="size-4 opacity-80" />
                                    <span><strong className="text-foreground mr-1">Deadline:</strong>{deadline}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button asChild className="w-full rounded-full">
                                <Link href="/login">Apply Now</Link>
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    )
}
