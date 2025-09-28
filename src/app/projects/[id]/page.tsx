import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar1 } from "@/components/ui/landingpage/navbar"
import Footer7 from "@/components/ui/landingpage/footer"
import {
    Tag, DollarSign, CalendarDays, MapPin, Users, Globe,
    Layers, Gauge, User, Code2, Briefcase, Clock, ShieldCheck, Sparkles
} from "lucide-react"

type ProjectRowProps = {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
};

function ProjectRow({ icon, label, value }: ProjectRowProps) {
    return (
        <div className="flex items-center gap-2 text-sm">
            {icon}
            <span className="font-medium">{label}:</span>
            <span className="opacity-80">{value || 'Not specified'}</span>
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
        const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
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

interface Props {
    params: { id: string }
}

export default async function ProjectDetailsPage({
    params,
}: Props) {
    const { id } = params;
    
    if (!id) {
        console.error('No project ID provided')
        notFound()
    }

    const data = await getProject(id)
    
    if (!data) {
        console.error('Project not found:', id)
        notFound()
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
    }

    return (
        <main className="min-h-screen bg-background">
            <Navbar1 />
            
            <section className="relative overflow-hidden">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col gap-4 py-6">
                        <h1 className="text-3xl font-bold">{displayData.title}</h1>
                        <p className="text-lg opacity-90">{displayData.description}</p>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-4">
                                <ProjectRow 
                                    icon={<Tag className="size-4 opacity-80" />} 
                                    label="Category" 
                                    value={displayData.category} 
                                />
                                <ProjectRow 
                                    icon={<DollarSign className="size-4 opacity-80" />} 
                                    label="Budget" 
                                    value={displayData.budget} 
                                />
                                <ProjectRow 
                                    icon={<CalendarDays className="size-4 opacity-80" />} 
                                    label="Deadline" 
                                    value={displayData.deadline} 
                                />
                                <ProjectRow 
                                    icon={<MapPin className="size-4 opacity-80" />} 
                                    label="Location" 
                                    value={displayData.location} 
                                />
                            </div>

                            <div className="space-y-4">
                                <ProjectRow 
                                    icon={<Gauge className="size-4 opacity-80" />} 
                                    label="Difficulty" 
                                    value={displayData.difficulty} 
                                />
                                <ProjectRow 
                                    icon={<Users className="size-4 opacity-80" />} 
                                    label="Team Size" 
                                    value={displayData.teamSize} 
                                />
                                <ProjectRow 
                                    icon={<Clock className="size-4 opacity-80" />} 
                                    label="Created" 
                                    value={displayData.created} 
                                />
                                <ProjectRow 
                                    icon={<Globe className="size-4 opacity-80" />} 
                                    label="Status" 
                                    value={displayData.status} 
                                />
                            </div>
                        </div>

                        {displayData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <span className="font-medium">Tags:</span>
                                {displayData.tags.map((tag: string) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {displayData.tech.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <span className="font-medium">Tech Stack:</span>
                                {displayData.tech.map((tech: string) => (
                                    <Badge key={tech} variant="outline">
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {displayData.requirements && (
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">Requirements</h2>
                                <p className="opacity-90">{displayData.requirements}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-4">
                            <Button variant="outline">
                                Contact Author
                            </Button>
                            <Button>
                                Apply Now
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer7 />
        </main>
    )
}
