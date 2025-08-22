"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectCard } from "@/components/ui/ProjectCard"
import { Pagination } from "@/components/ui/Pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Project } from "@/lib/models/Project"
import { ProjectApplication } from "@/lib/models/Project"
import { Plus, Users, Briefcase, Calendar, Mail, ExternalLink, Filter } from "lucide-react"
import { toast } from "sonner"
import { ApplicationModal } from "@/components/ui/ApplicationModal"

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

interface ApplicationsResponse {
  applications: ProjectApplication[]
  pagination: {
    currentPage: number
    totalPages: number
    totalApplications: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("explore")
  
  // My Projects states
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [myProjectsLoading, setMyProjectsLoading] = useState(true)
  const [myProjectsPage, setMyProjectsPage] = useState(1)
  const [myProjectsTotalPages, setMyProjectsTotalPages] = useState(1)
  const [myProjectsTotal, setMyProjectsTotal] = useState(0)

  // Explore (all) projects states
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [allProjectsLoading, setAllProjectsLoading] = useState(true)
  const [allProjectsPage, setAllProjectsPage] = useState(1)
  const [allProjectsTotalPages, setAllProjectsTotalPages] = useState(1)
  const [allProjectsTotal, setAllProjectsTotal] = useState(0)
  // Explore filters
  const [exploreSearch, setExploreSearch] = useState("")
  const [exploreCategory, setExploreCategory] = useState("")
  const [exploreDifficulty, setExploreDifficulty] = useState("")
  const [exploreLocation, setExploreLocation] = useState("")
  
  // Applications states
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [applicationsPage, setApplicationsPage] = useState(1)
  const [applicationsTotalPages, setApplicationsTotalPages] = useState(1)
  const [applicationsTotal, setApplicationsTotal] = useState(0)

  // Application modal states
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/login')
      } finally {
        setUserLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const fetchMyProjects = async () => {
    setMyProjectsLoading(true)
    try {
      const params = new URLSearchParams({
        page: myProjectsPage.toString(),
        limit: "9",
      })

      const response = await fetch(`/api/projects/my-projects?${params}`)
      if (response.ok) {
        const data: ProjectsResponse = await response.json()
        setMyProjects(data.projects)
        setMyProjectsTotalPages(data.pagination.totalPages)
        setMyProjectsTotal(data.pagination.totalProjects)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setMyProjectsLoading(false)
    }
  }

  const fetchAllProjects = async () => {
    setAllProjectsLoading(true)
    try {
      const params = new URLSearchParams({
        page: allProjectsPage.toString(),
        limit: "9",
        ...(exploreSearch && { search: exploreSearch }),
        ...(exploreCategory && { category: exploreCategory }),
        ...(exploreDifficulty && { difficulty: exploreDifficulty }),
        ...(exploreLocation && { location: exploreLocation }),
      })

      const response = await fetch(`/api/projects?${params}`)
      if (response.ok) {
        const data: ProjectsResponse = await response.json()
        setAllProjects(data.projects)
        setAllProjectsTotalPages(data.pagination.totalPages)
        setAllProjectsTotal(data.pagination.totalProjects)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setAllProjectsLoading(false)
    }
  }

  const fetchApplications = async () => {
    setApplicationsLoading(true)
    try {
      const params = new URLSearchParams({
        page: applicationsPage.toString(),
        limit: "10"
      })

      const response = await fetch(`/api/applications?${params}`)
      if (response.ok) {
        const data: ApplicationsResponse = await response.json()
        // Ensure all applications have proper fallbacks
        const sanitizedApplications = data.applications.map(app => ({
          ...app,
          applicantName: app.applicantName || 'Unknown Applicant',
          applicantEmail: app.applicantEmail || 'No email provided',
          coverLetter: app.coverLetter || 'No cover letter provided',
          experience: app.experience || 'No experience provided',
          status: app.status || 'pending'
        }))
        setApplications(sanitizedApplications)
        setApplicationsTotalPages(data.pagination.totalPages)
        setApplicationsTotal(data.pagination.totalApplications)
      } else {
        console.error('Failed to fetch applications:', response.status)
        toast.error("Failed to load applications")
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Failed to load applications")
    } finally {
      setApplicationsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "my-projects") {
      fetchMyProjects()
    } else if (activeTab === "applications") {
      fetchApplications()
    } else if (activeTab === "explore") {
      fetchAllProjects()
    }
  }, [activeTab, myProjectsPage, allProjectsPage, applicationsPage, exploreSearch, exploreCategory, exploreDifficulty, exploreLocation])

  const handleMyProjectsPageChange = (page: number) => {
    setMyProjectsPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleAllProjectsPageChange = (page: number) => {
    setAllProjectsPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleApplicationsPageChange = (page: number) => {
    setApplicationsPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCreateProject = () => {
    router.push("/dashboard/create-project")
  }

  const handleEditProject = (projectId: string) => {
    router.push(`/dashboard/edit-project/${projectId}`)
  }

  const handleApply = (project: Project) => {
    if (!user) {
      toast.error("Please log in to apply for projects")
      router.push("/login")
      return
    }
    
    // Check if user is applying to their own project
    if (project.authorId === user.id) {
      toast.error("You cannot apply to your own project")
      return
    }
    
    setSelectedProject(project)
    setIsApplicationModalOpen(true)
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success("Project deleted successfully!");
        fetchMyProjects(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'N/A'
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const clearExploreFilters = () => {
    setExploreSearch("")
    setExploreCategory("")
    setExploreDifficulty("")
    setExploreLocation("")
    setAllProjectsPage(1)
  }

  // Show loading while fetching user data
  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your projects and applications</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="explore" className="flex items-center gap-2">
              Explore
            </TabsTrigger>
            <TabsTrigger value="my-projects" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              My Projects
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Applications ({applicationsTotal})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Explore Projects</h2>
            </div>

            {/* Explore Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Search by name, description, tags"
                value={exploreSearch}
                onChange={(e) => { setExploreSearch(e.target.value); setAllProjectsPage(1) }}
              />
              <Select value={exploreCategory} onValueChange={(v) => { setExploreCategory(v === 'all' ? '' : v); setAllProjectsPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Web Design">Web Design</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                  <SelectItem value="Game Development">Game Development</SelectItem>
                </SelectContent>
              </Select>
              <Select value={exploreDifficulty} onValueChange={(v) => { setExploreDifficulty(v === 'all' ? '' : v); setAllProjectsPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Location (e.g., Remote, Casablanca)"
                value={exploreLocation}
                onChange={(e) => { setExploreLocation(e.target.value); setAllProjectsPage(1) }}
              />
              <div className="md:col-span-4 flex justify-end">
                <Button variant="outline" onClick={clearExploreFilters} className="h-9">Clear Filters</Button>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  {allProjectsLoading ? "Loading..." : `${allProjectsTotal} projects found`}
                </p>
                {allProjectsTotal > 0 && (
                  <p className="text-sm md:text-base text-muted-foreground">
                    Page {allProjectsPage} of {allProjectsTotalPages}
                  </p>
                )}
              </div>

              {allProjectsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-72 sm:h-80 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : allProjects.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {allProjects.map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        onApply={handleApply}
                        currentUser={user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : undefined}
                      />
                    ))}
                  </div>
                  
                  <Pagination
                    currentPage={allProjectsPage}
                    totalPages={allProjectsTotalPages}
                    onPageChange={handleAllProjectsPageChange}
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No projects found
                  </h3>
                  <p className="text-muted-foreground">
                    Please check back later
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Projects</h2>
              <Button onClick={handleCreateProject} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  {myProjectsLoading ? "Loading..." : `${myProjectsTotal} projects found`}
                </p>
                {myProjectsTotal > 0 && (
                  <p className="text-sm md:text-base text-muted-foreground">
                    Page {myProjectsPage} of {myProjectsTotalPages}
                  </p>
                )}
              </div>

              {myProjectsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-72 sm:h-80 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : myProjects.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {myProjects.map((project) => (
                      <div key={project._id} className="relative">
                        <ProjectCard
                          project={project}
                          onApply={() => {}} // No apply button for own projects
                          currentUser={user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : undefined}
                          showEditDelete={true}
                          onEdit={handleEditProject}
                          onDelete={handleDeleteProject}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <Pagination
                    currentPage={myProjectsPage}
                    totalPages={myProjectsTotalPages}
                    onPageChange={handleMyProjectsPageChange}
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No projects yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first project to start connecting with developers
                  </p>
                  <Button onClick={handleCreateProject}>
                    Create Your First Project
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Applications</h2>
            </div>

            <div className="space-y-4">
              {applicationsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : applications.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <Card key={application._id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="" alt={application.applicantName || 'Applicant'} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {(application.applicantName || 'Unknown').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {application.applicantName || 'Unknown Applicant'}
                                </h3>
                                <Badge className={getStatusColor(application.status)}>
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {application.applicantEmail || 'No email provided'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(application.createdAt)}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-foreground mb-1">Cover Letter</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {application.coverLetter}
                                  </p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-foreground mb-1">Experience</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {application.experience}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {application.portfolio && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={application.portfolio} target="_blank" rel="noopener noreferrer">
                                        Portfolio <ExternalLink className="h-3 w-3 ml-1" />
                                      </a>
                                    </Button>
                                  )}
                                  {application.github && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={application.github} target="_blank" rel="noopener noreferrer">
                                        GitHub <ExternalLink className="h-3 w-3 ml-1" />
                                      </a>
                                    </Button>
                                  )}
                                  {application.linkedin && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={application.linkedin} target="_blank" rel="noopener noreferrer">
                                        LinkedIn <ExternalLink className="h-3 w-3 ml-1" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <Pagination
                    currentPage={applicationsPage}
                    totalPages={applicationsTotalPages}
                    onPageChange={handleApplicationsPageChange}
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No applications yet
                  </h3>
                  <p className="text-muted-foreground">
                    Applications to your projects will appear here
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Modal */}
      {selectedProject && (
        <ApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => {
            setIsApplicationModalOpen(false)
            setSelectedProject(null)
          }}
          projectId={selectedProject._id || ""}
          projectTitle={selectedProject.title}
        />
      )}
    </div>
  )
}
