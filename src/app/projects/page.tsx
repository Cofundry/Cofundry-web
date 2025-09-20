// D:\Cofundry\Cofundry-web\src\app\projects\page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Navbar1 } from "@/components/ui/landingpage/navbar"
import { Footer7 } from "@/components/ui/landingpage/footer"
import { Pagination } from "@/components/ui/Pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Project } from "@/lib/models/Project"
import {
  X, ArrowRight, Search, SlidersHorizontal, ChevronDown,
  Layers, Gauge, MapPin, Heart, CalendarDays, DollarSign
} from "lucide-react"

/* -------------------------------- Types -------------------------------- */
interface ProjectsResponse {
  projects: Project[]
  pagination: {
    currentPage: number
    totalPages: number
    totalProjects: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

/* ------------------------------- Helpers -------------------------------- */
function getProjectId(p: any): string {
  const raw = p?.slug ?? p?.id ?? p?._id
  if (!raw) return ""
  if (typeof raw === "string") return raw
  if (typeof raw === "object") return raw?.$oid ?? raw?.toString?.() ?? ""
  return String(raw)
}

/** Deterministic (SSR/CSR-safe) date format: YYYY-MM-DD */
function formatDateUTC(value?: string) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toISOString().slice(0, 10)
}

/** Tiny classnames helper */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

/** Deterministic number formatting (no locale) */
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

/* -------------------------------- Page ---------------------------------- */
export default function ProjectsIndexPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProjects, setTotalProjects] = useState(0)

  // filters
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [location, setLocation] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "9",
        ...(search && { search }),
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(location && { location }),
      })
      const res = await fetch(`/api/projects?${params}`, { cache: "no-store" })
      if (res.ok) {
        const data: ProjectsResponse = await res.json()
        setProjects(data.projects)
        setTotalPages(data.pagination.totalPages)
        setTotalProjects(data.pagination.totalProjects)
      } else {
        setProjects([])
        setTotalPages(1)
        setTotalProjects(0)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, category, difficulty, location])

  const clearFilters = () => {
    setSearch("")
    setCategory("")
    setDifficulty("")
    setLocation("")
    setCurrentPage(1)
  }

  const clearOne = (k: "search" | "category" | "difficulty" | "location") => {
    if (k === "search") setSearch("")
    if (k === "category") setCategory("")
    if (k === "difficulty") setDifficulty("")
    if (k === "location") setLocation("")
    setCurrentPage(1)
  }

  // derive option lists from current data (kept deterministic)
  const { categories, difficulties, locations } = useMemo(() => {
    const cats = new Set<string>()
    const diffs = new Set<string>()
    const locs = new Set<string>()
    projects.forEach((p: any) => {
      if (p?.category) cats.add(p.category)
      if (p?.difficulty) diffs.add(p.difficulty)
      if (p?.location) locs.add(p.location)
    })
    return {
      categories: Array.from(cats).sort(),
      difficulties: Array.from(diffs).sort(),
      locations: Array.from(locs).sort(),
    }
  }, [projects])

  return (
    <div className="min-h-screen bg-background">
      <Navbar1 />

      {/* ========================= HERO ========================= */}
      <section className="relative overflow-hidden">
        {/* animated background layers */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* faint grid */}
          <div
            className="absolute inset-0 opacity-[0.08] dark:opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          {/* rotating ring */}
          <div className="absolute left-1/2 top-1/2 h-[48rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 opacity-25 motion-safe:animate-[spin_40s_linear_infinite]">
            <div
              className="h-full w-full rounded-full"
              style={{ boxShadow: "0 0 160px 24px hsl(var(--primary)/.18) inset, 0 0 160px 16px hsl(var(--primary)/.12)" }}
            />
          </div>
          {/* sweeping beam */}
          <div
            className="absolute -left-24 top-0 h-[120%] w-[60%] -skew-x-12 opacity-40 blur-2xl motion-safe:animate-[pulse_5s_ease-in-out_infinite] pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)/.25), transparent)" }}
          />
          {/* radial orbs */}
          <div
            className="absolute -top-40 left-[8%] h-[34rem] w-[34rem] rounded-full blur-3xl"
            style={{ background: "radial-gradient(closest-side, hsl(var(--primary)) 0%, transparent 70%)", opacity: .22 }}
          />
          <div
            className="absolute -bottom-48 right-[6%] h-[28rem] w-[28rem] rounded-full blur-3xl"
            style={{ background: "radial-gradient(closest-side, hsl(var(--primary)) 0%, transparent 70%)", opacity: .18 }}
          />
        </div>

        <div className="container mx-auto px-4 py-14 sm:py-18">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_12px_hsl(var(--primary))]" />
              Projects
            </span>
            <h1 className="mt-5 text-[clamp(1.75rem,2.2vw+1.2rem,3.25rem)] sm:text-5xl font-semibold tracking-tight">
              Find, join, and <span className="text-[hsl(var(--primary))]">ship the future</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-muted-foreground sm:text-lg">
              Search by keywords or use filters to narrow by category, difficulty, and location.
            </p>

            {/* Quick search inline (hero) */}
            <div className="mx-auto mt-6 max-w-2xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                  placeholder="Search projects (e.g., fintech, AI agent, hackathon)..."
                  className="pl-12 pr-28 h-12 rounded-full border-white/10 bg-white/10 backdrop-blur focus-visible:ring-[hsl(var(--primary))]"
                />
                <Button
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={() => setCurrentPage(1)}
                >
                  Search
                </Button>
              </div>
              {/* Mobile filter toggle */}
              <div className="mt-3 flex items-center justify-center sm:hidden">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setFiltersOpen((v) => !v)}
                >
                  <SlidersHorizontal className="mr-2 size-4" />
                  Filters
                  <ChevronDown className={cn("ml-1 size-4 transition-transform", filtersOpen && "rotate-180")} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= CONTENT ========================= */}
      <main className="pb-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* -------- Filter Panel (modern) -------- */}
            <aside className="lg:w-80 flex-shrink-0" aria-label="Project filters">
              <div
                className={cn(
                  "rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] backdrop-blur",
                  "p-4 lg:sticky lg:top-6",
                  !filtersOpen && "hidden sm:block",
                )}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold tracking-wide">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 rounded-full"
                    onClick={clearFilters}
                  >
                    Reset
                  </Button>
                </div>

                {/* Category */}
                <div className="mt-4">
                  <label className="text-xs font-medium">Category</label>
                  <div className="mt-2 relative">
                    <Layers className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                    <select
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setCurrentPage(1) }}
                      className="w-full appearance-none rounded-full border border-white/10 bg-white/10 px-9 py-2.5 pr-10 text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    >
                      <option value="">All</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-70" />
                  </div>
                </div>

                {/* Difficulty (segmented chips) */}
                <div className="mt-4">
                  <label className="text-xs font-medium">Difficulty</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["", ...difficulties].map((d) => (
                      <button
                        key={d || "all"}
                        onClick={() => { setDifficulty(d); setCurrentPage(1) }}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs transition",
                          difficulty === d
                            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.15)]"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        {d || "All"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="mt-4">
                  <label className="text-xs font-medium">Location</label>
                  <div className="mt-2 relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                    <select
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); setCurrentPage(1) }}
                      className="w-full appearance-none rounded-full border border-white/10 bg-white/10 px-9 py-2.5 pr-10 text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    >
                      <option value="">Anywhere</option>
                      {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-70" />
                  </div>
                </div>

                {/* Active filter chips */}
                {(search || category || difficulty || location) && (
                  <div className="mt-5">
                    <p className="text-xs text-muted-foreground mb-2">Active</p>
                    <div className="flex flex-wrap gap-2">
                      {search && <ActiveChip label={`“${search}”`} onClear={() => clearOne("search")} />}
                      {category && <ActiveChip label={category} onClear={() => clearOne("category")} />}
                      {difficulty && <ActiveChip label={difficulty} onClear={() => clearOne("difficulty")} />}
                      {location && <ActiveChip label={location} onClear={() => clearOne("location")} />}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* -------- Results + Grid -------- */}
            <section className="flex-1">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm md:text-base text-muted-foreground font-medium" aria-live="polite">
                  {loading ? "Loading…" : `${totalProjects} projects found`}
                </p>
                <p className="text-sm md:text-base text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-44 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[.05] animate-pulse"
                    />
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
                    {projects.map((p, i) => (
                      <ProjectCardFuturistic key={getProjectId(p) || String(i)} project={p} />
                    ))}
                  </div>

                  <nav aria-label="Project pagination">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </nav>
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground">Try different filters</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer7
        sections={[
          { title: "Platform", links: [{ name: "Home", href: "/" }, { name: "Projects", href: "/projects" }] },
          { title: "Account", links: [{ name: "Login", href: "/login" }, { name: "Sign up", href: "/register" }] },
        ]}
      />
    </div>
  )
}

/* ====================== UI bits ====================== */

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs backdrop-blur">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="rounded-full p-0.5 hover:bg-white/10"
        aria-label={`Remove ${label}`}
      >
        <X className="size-3.5" />
      </button>
    </span>
  )
}

/* ---- Logo + initials ring ---- */
function LogoMark({ src, name, size = 56 }: { src?: string; name: string; size?: number }) {
  const initials = getInitials(name)
  const gradient = getGradientFromString(name)
  return (
    <div className="relative shrink-0 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm" style={{ width: size, height: size }}>
      <div className="absolute -inset-[2px] rounded-[14px] opacity-60 blur-md" style={{ background: gradient }} />
      <div className="relative flex h-full w-full items-center justify-center rounded-xl overflow-hidden">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`${name} logo`} className="h-full w-full object-contain p-2" loading="lazy" />
        ) : (
          <span className="text-sm font-semibold">{initials}</span>
        )}
      </div>
    </div>
  )
}

function getInitials(name?: string) {
  if (!name) return "??"
  const parts = String(name).trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "??"
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

/* ---- Card (more data, still clean) ---- */
function ProjectCardFuturistic({ project }: { project: any }) {
  const id = getProjectId(project)
  const title = project?.title ?? project?.name ?? "Untitled project"
  const desc = project?.shortDescription ?? project?.summary ?? project?.description ?? ""
  const category = project?.category
  const difficulty = project?.difficulty
  const location = project?.location
  const likes = project?.likes ?? 0
  const budget = formatBudget(project?.budget)
  const deadline = project?.deadline
  const logoSrc =
    project?.logoUrl ?? project?.logo ?? project?.brand?.logo ?? project?.avatar ?? ""

  return (
    <article className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.05] p-4 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,.18)]">
      {/* conic glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-90"
        style={{ background: "conic-gradient(from 0deg at 50% 50%, transparent, hsl(var(--primary)/.25), transparent)" }}
      />

      <div className="relative flex items-start gap-3">
        <LogoMark src={logoSrc} name={title} size={56} />
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-tight line-clamp-1">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{desc}</p>

          {/* meta row */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
            {category && (
              <span className="inline-flex items-center gap-1.5">
                <Layers className="size-3.5 opacity-80" /> {category}
              </span>
            )}
            {difficulty && (
              <span className="inline-flex items-center gap-1.5">
                <Gauge className="size-3.5 opacity-80" /> {difficulty}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 opacity-80" /> {location}
              </span>
            )}
            {!!likes && (
              <span className="inline-flex items-center gap-1.5">
                <Heart className="size-3.5 opacity-80" /> {likes}
              </span>
            )}
          </div>

          {/* budget / deadline */}
          {(budget || deadline) && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              {budget && (
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign className="size-3.5 opacity-80" /> {budget}
                </span>
              )}
              {deadline && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 opacity-80" /> {formatDateUTC(deadline)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Updated {formatDateUTC(project?.updatedAt || project?.createdAt)}
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
