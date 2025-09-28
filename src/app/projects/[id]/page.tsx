import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar1 } from "@/components/ui/landingpage/navbar"
import Footer7 from "@/components/ui/landingpage/footer"
import {
    Tag, DollarSign, CalendarDays, MapPin, Users, Globe,
    Layers, Gauge, User, Code2, Briefcase, Clock, ShieldCheck, Sparkles
} from "lucide-react"
import ProjectClientFallback from '@/components/ui/ProjectClientFallback'
import ProjectActionButtons from '@/components/ui/ProjectActionButtons'

type ProjectRowProps = {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
};

function ProjectRow({ icon, label, value }: ProjectRowProps) {
    return (
        <div className="flex items-center gap-2 text-sm py-1">
            <span className="text-muted-foreground">{icon}</span>
            <span className="font-medium text-foreground">{label}:</span>
            <span className="text-muted-foreground">{value || 'Not specified'}</span>
        </div>
    );
}

function formatDateUTC(value?: string | Date | null) {
    if (!value) return "Not specified"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "Not specified"
    return d.toISOString().slice(0, 10)
}

function formatBudget(b: any): string {
    if (!b) return "Not specified"
    if (typeof b === "string") return b
    if (typeof b === "number") return `$${b.toLocaleString()}`
    if (typeof b === "object") {
        const cur = b.currency ?? "$"
        if (b.min != null && b.max != null) 
            return `${cur}${Number(b.min).toLocaleString()}–${cur}${Number(b.max).toLocaleString()}`
        if (b.amount != null) 
            return `${cur}${Number(b.amount).toLocaleString()}`
    }
    return "Not specified"
}

async function getProject(id: string) {
    try {
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
        const url = `${base}/api/projects/${encodeURIComponent(id)}`
        const res = await fetch(url, {
            cache: "no-store",
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!res.ok) {
            console.error('Project fetch failed:', res.status, res.statusText)
            return null
        }

        const data = await res.json()
        return data
    } catch (error) {
        console.error('Error fetching project:', error)
        return null
    }
}

export default async function ProjectDetailsPage(props: any) {
    const params = props.params
    const { id } = await params
    
    if (!id) {
        console.error('No project ID provided')
        notFound()
    }

    const data = await getProject(id)

    // If server-side fetch failed, render a client-side fallback to diagnose or display the project
    if (!data) {
        console.warn('Server fetch failed; rendering client-side fallback for id:', id)
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <Navbar1 />
                <section className="w-full max-w-3xl px-4 py-8">
                    {/* Client-side fallback will attempt to fetch and display the project */}
                    {/* @ts-ignore */}
                    <ProjectClientFallback id={id} />
                </section>
                <Footer7 />
            </main>
        )
    }

    // Extract project data with defaults
    const displayData = {
        title: data.title || data.name || "Project",
        description: data.description || data.summary || "No description provided",
        category: data.category || "Not specified",
        difficulty: data.difficulty || "Not specified",
        location: data.location || "Not specified",
        budget: formatBudget(data.budget),
        deadline: formatDateUTC(data.deadline),
        created: formatDateUTC(data.createdAt),
        status: data.status || "open",
        tags: Array.isArray(data.tags) ? data.tags : [],
        tech: Array.isArray(data.techStack) ? data.techStack : [],
        requirements: data.requirements || "",
        teamSize: data.teamSize?.toString() || "Not specified",
        authorName: data.authorName || "Anonymous User",
        authorEmail: data.authorEmail || data.email || null,
    }

    return (
        <main className="relative min-h-screen bg-background flex flex-col">
            <Navbar1 />

            <div className="flex-grow flex items-start justify-center w-full py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-6xl bg-background border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 p-6 md:p-8">
                        {/* Left: Main content */}
                        <div className="md:col-span-2 space-y-6">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">{displayData.title}</h1>
                            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{displayData.description}</p>

                            <section className="mt-4">
                                <h2 className="text-xl font-semibold mb-3 text-foreground">Project details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <ProjectRow icon={<Tag className="h-4 w-4" />} label="Category" value={displayData.category} />
                                        <ProjectRow icon={<DollarSign className="h-4 w-4" />} label="Budget" value={displayData.budget} />
                                        <ProjectRow icon={<CalendarDays className="h-4 w-4" />} label="Deadline" value={displayData.deadline} />
                                    </div>
                                    <div className="space-y-3">
                                        <ProjectRow icon={<MapPin className="h-4 w-4" />} label="Location" value={displayData.location} />
                                        <ProjectRow icon={<Users className="h-4 w-4" />} label="Team size" value={displayData.teamSize} />
                                        <div className="flex items-center gap-2 text-sm">
                                            <Globe className="h-4 w-4" />
                                            <span className="font-medium">Status:</span>
                                            <Badge variant="outline" className="capitalize bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                                                {displayData.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {displayData.requirements && (
                                <section>
                                    <h3 className="text-lg font-medium mb-2 text-foreground">Requirements</h3>
                                    <div className="prose prose-invert max-w-none text-foreground/80">{displayData.requirements}</div>
                                </section>
                            )}

                            {displayData.tech.length > 0 && (
                                <section className="border-t border-white/10 pt-6">
                                    <h3 className="text-lg font-semibold mb-3 text-foreground">Tech stack</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {displayData.tech.map((t: string) => (
                                            <Badge key={t} variant="outline" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right: Sidebar / CTAs */}
                        <aside className="md:col-span-1 space-y-6">
                            <div className="rounded-lg overflow-hidden border border-white/10 bg-white/5">
                                <div className="p-4 border-b border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Posted by</p>
                                            <p className="font-medium text-foreground">{displayData.authorName}</p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{displayData.created}</div>
                                    </div>
                                </div>

                                <ProjectActionButtons 
                                    title={displayData.title}
                                    authorEmail={displayData.authorEmail}
                                />
                            </div>

                            <div className="rounded-lg overflow-hidden border border-white/10 bg-white/5">
                                <div className="p-4 border-b border-white/10">
                                    <h4 className="font-medium text-foreground">Quick info</h4>
                                </div>
                                <div className="p-4 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Category</span>
                                        <span className="text-foreground">{displayData.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Budget</span>
                                        <span className="text-foreground">{displayData.budget}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Deadline</span>
                                        <span className="text-foreground">{displayData.deadline}</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            <Footer7 />
        </main>
    )
}
