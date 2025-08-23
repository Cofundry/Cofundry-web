
"use client"

import { useState, useEffect } from "react"
import Hero from "@/components/ui/landingpage/hero"
import { Footer7 } from "@/components/ui/landingpage/footer"
import { Navbar1 } from "@/components/ui/landingpage/navbar"
import { ProjectCard } from "@/components/ui/ProjectCard"
import { FilterSidebar } from "@/components/ui/FilterSidebar"
import { Pagination } from "@/components/ui/Pagination"
import { ApplicationModal } from "@/components/ui/ApplicationModal"
import { Project } from "@/lib/models/Project"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLoading } from "@/components/ui/LoadingProvider"


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

export default function HomePage() {
  const router = useRouter()
  const { setLoading } = useLoading()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLocalLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProjects, setTotalProjects] = useState(0)
  
  // Filter states
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [location, setLocation] = useState("")
  
  // Modal states
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const fetchProjects = async () => {
    setLocalLoading(true)
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

      const response = await fetch(`/api/projects?${params}`)
      if (response.ok) {
        const data: ProjectsResponse = await response.json()
        setProjects(data.projects)
        setTotalPages(data.pagination.totalPages)
        setTotalProjects(data.pagination.totalProjects)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setLocalLoading(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [currentPage, search, category, difficulty, location])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleApply = (project: Project) => {
    // Always redirect to login when trying to apply
    toast.info("Please log in to apply for projects")
    router.push("/login")
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("")
    setDifficulty("")
    setLocation("")
    setCurrentPage(1)
  }

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": " Cofundry",
            "description": "The premier platform for students, SaaS developers, and professionals to collaborate on innovative projects",
            "url": "https://cofundry.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://cofundry.com/projects?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": " Cofundry",
              "logo": {
                "@type": "ImageObject",
                "url": "https://cofundry.com/ChatGPT Image Aug 22, 2025, 05_05_35 PM.png"
              }
            }
          })
        }}
      />

      <div className="min-h-screen bg-background">
        <header>
          <Navbar1 />
        </header>
        
        <main>
          <Hero />
          
          {/* Projects Section */}
          <section className="py-16 px-4" aria-labelledby="projects-heading">
            <div className="container mx-auto">
              <h2 id="projects-heading" className="sr-only">Available Projects</h2>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Filter Sidebar */}
                <aside className="lg:w-80 flex-shrink-0" aria-label="Project filters">
                  <FilterSidebar
                    search={search}
                    category={category}
                    difficulty={difficulty}
                    location={location}
                    onSearchChange={setSearch}
                    onCategoryChange={setCategory}
                    onDifficultyChange={setDifficulty}
                    onLocationChange={setLocation}
                    onClearFilters={clearFilters}
                  />
                </aside>

                {/* Projects Grid */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                    <p className="text-sm md:text-base text-muted-foreground font-medium">
                      {loading ? "Loading..." : `${totalProjects} projects found`}
                    </p>
                    {totalProjects > 0 && (
                      <p className="text-sm md:text-base text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </p>
                    )}
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" aria-label="Loading projects">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-72 sm:h-80 bg-muted animate-pulse rounded-lg" aria-hidden="true" />
                      ))}
                    </div>
                  ) : projects.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8" role="list" aria-label="Project listings">
                        {projects.map((project) => (
                          <article key={project._id} role="listitem">
                            <ProjectCard
                              project={project}
                              onApply={handleApply}
                            />
                          </article>
                        ))}
                      </div>
                      
                      <nav aria-label="Project pagination">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      </nav>
                    </>
                  ) : (
                    <div className="text-center py-12" role="status" aria-live="polite">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No projects found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search criteria or check back later
                      </p>
                      <button
                        onClick={clearFilters}
                        className="text-primary hover:underline"
                        aria-label="Clear all search filters"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>



        </main>

        <footer>
          <Footer7 
            sections={[
              {
                title: "Platform",
                links: [
                  { name: "Home", href: "/" },
                  { name: "Projects", href: "/projects" },
                  { name: "How It Works", href: "#" }
                ]
              },
              {
                title: "Account",
                links: [
                  { name: "Login", href: "/login" },
                  { name: "Sign up", href: "/register" }
                ]
              }
            ]}
          />
        </footer>
      </div>
    </>
  )
}
