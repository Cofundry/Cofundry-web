
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
  
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
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
    <div className="min-h-screen bg-background">
      <Navbar1 />
      <Hero />
      
      {/* Projects Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
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
            </div>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-72 sm:h-80 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        onApply={handleApply}
                      />
                    ))}
                  </div>
                  
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No projects found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or check back later
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
    </div>
  )
}
