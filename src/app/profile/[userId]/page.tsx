"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProjectCard } from "@/components/ui/ProjectCard"
import { Pagination } from "@/components/ui/Pagination"
import { Project } from "@/lib/models/Project"
import { Mail, MapPin, Globe, Github, Linkedin, Calendar, Briefcase } from "lucide-react"

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
interface User {
  _id: string
  name: string
  email?: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string
  createdAt?: string | Date
  hourlyRate?: number
  skills?: string[]
}
export default function UserProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProjects, setTotalProjects] = useState(0)

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProjects = async () => {
    setProjectsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "6"
      })

      const response = await fetch(`/api/projects?${params}&authorId=${userId}`)
      if (response.ok) {
        const data: ProjectsResponse = await response.json()
        setProjects(data.projects)
        setTotalPages(data.pagination.totalPages)
        setTotalProjects(data.pagination.totalProjects)
      }
    } catch (error) {
      console.error("Error fetching user projects:", error)
    } finally {
      setProjectsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [userId])

  useEffect(() => {
    if (user) {
      fetchUserProjects()
    }
  }, [user, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'N/A'
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-64 bg-muted rounded-lg"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
            <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const userInitials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Banner with Hero-like animated gradient */}
        <div className="relative mb-16">
          <div className="relative flex items-center justify-center h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden bg-white">
            <div className="absolute inset-0 z-0 animate-gradient bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 opacity-30 blur-2xl" style={{ pointerEvents: 'none' }} />
            <svg className="absolute left-0 bottom-0 w-1/3 max-w-xs opacity-60 pointer-events-none" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 100 Q60 20 120 80 T220 100" stroke="#111" strokeWidth="3" fill="none"/>
              <circle cx="40" cy="110" r="8" fill="#111"/>
              <rect x="180" y="90" width="18" height="8" fill="#111" rx="4"/>
            </svg>
            <svg className="absolute right-0 top-0 w-1/3 max-w-xs opacity-60 pointer-events-none" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M280 20 Q240 100 180 40 T80 20" stroke="#111" strokeWidth="3" fill="none"/>
              <circle cx="260" cy="30" r="8" fill="#111"/>
              <rect x="100" y="30" width="18" height="8" fill="#111" rx="4"/>
            </svg>
          </div>

          {/* Centered Avatar overlapping the banner */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-md">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <Card className="pt-14">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription>{user.bio || 'No bio available'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                )}
                
                {user.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.location}</span>
                  </div>
                )}

                {user.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}

                {user.github && (
                  <div className="flex items-center gap-2 text-sm">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={user.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      GitHub Profile
                    </a>
                  </div>
                )}

                {user.linkedin && (
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={user.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}

                {user.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Member since {formatDate(user.createdAt)}
                    </span>
                  </div>
                )}

                {user.hourlyRate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      ${user.hourlyRate}/hr
                    </span>
                  </div>
                )}

                {user.skills && user.skills.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-medium text-foreground mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Projects</h2>
              <p className="text-muted-foreground">
                {totalProjects} project{totalProjects !== 1 ? 's' : ''} by {user.name}
              </p>
            </div>

            {projectsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-72 sm:h-80 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      onApply={() => {}} // No apply button on profile page
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
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No projects yet
                </h3>
                <p className="text-muted-foreground">
                  {user.name} hasn't posted any projects yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
