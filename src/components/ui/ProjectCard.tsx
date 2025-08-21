"use client"

import { Calendar, MapPin, Users, Code, DollarSign, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Project } from "@/lib/models/Project"
import Link from "next/link"

interface ProjectCardProps {
  project: Project
  onApply?: (projectId: string) => void
}

export function ProjectCard({ project, onApply }: ProjectCardProps) {
  const formatDate = (date?: Date | string) => {
    if (!date) return null
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDifficultyColor = (difficulty?: string) => {
    const normalized = (difficulty || '').toLowerCase()
    switch (normalized) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category?: string) => {
    const normalized = (category || '').toLowerCase()
    switch (normalized) {
      case 'web-development':
      case 'software':
        return 'bg-blue-100 text-blue-800'
      case 'mobile-development':
      case 'mobile':
        return 'bg-purple-100 text-purple-800'
      case 'ai-ml':
      case 'ai':
        return 'bg-orange-100 text-orange-800'
      case 'data-science':
        return 'bg-green-100 text-green-800'
      case 'blockchain':
        return 'bg-indigo-100 text-indigo-800'
      case 'game-development':
        return 'bg-pink-100 text-pink-800'
      case 'web design':
        return 'bg-cyan-100 text-cyan-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const displayTitle = project.title || 'Untitled Project'
  const displayDescription = project.description || 'No description provided.'
  const displayCategory = project.category
  const displayDifficulty = project.difficulty
  const displayLocation = project.location
  const displayDeadline = formatDate(project.deadline || project.createdAt)

  const techList = Array.isArray(project.techStack) && project.techStack.length > 0
    ? project.techStack
    : (Array.isArray(project.tags) ? project.tags : [])

  const teamSize = typeof project.teamSize === 'number' ? project.teamSize : undefined

  // Author info with fallbacks
  const authorName = project.authorName || 'Anonymous User'
  const authorEmail = project.authorEmail || 'user@example.com'
  const authorAvatar = project.authorAvatar || (project.contactInfo?.github ? `https://github.com/${project.contactInfo.github.split('/').pop()}.png` : undefined)
  const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg md:text-xl font-semibold line-clamp-2 text-foreground leading-tight">
              {displayTitle}
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
              {displayDescription}
            </CardDescription>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {displayCategory && (
            <Badge className={`${getCategoryColor(displayCategory)} text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5`}>
              {String(displayCategory).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          )}
          {displayDifficulty && (
            <Badge className={`${getDifficultyColor(displayDifficulty)} text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5`}>
              {String(displayDifficulty).charAt(0).toUpperCase() + String(displayDifficulty).slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="space-y-3">
          {/* Tech Stack */}
          {techList.length > 0 && (
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <div className="flex flex-wrap gap-1.5">
                {techList.slice(0, 3).map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5">
                    {tech}
                  </Badge>
                ))}
                {techList.length > 3 && (
                  <Badge variant="outline" className="text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5">
                    +{techList.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm md:text-base">
            {typeof teamSize === 'number' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 md:h-5 md:w-5" />
                <span className="font-medium">{teamSize} people</span>
              </div>
            )}
            {displayLocation && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                <span className="capitalize font-medium">{displayLocation}</span>
              </div>
            )}
            {displayDeadline && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                <span className="font-medium">{displayDeadline}</span>
              </div>
            )}
            {project.budget && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
                <span className="font-medium">
                  {project.budget.min}-{project.budget.max} {project.budget.currency}
                </span>
              </div>
            )}
          </div>

          {/* Requirements Preview */}
          {(project.requirements || project.description) && (
            <div className="text-sm md:text-base text-muted-foreground">
              <span className="font-medium">Requirements:</span>
              <p className="line-clamp-2 mt-2 leading-relaxed">{project.requirements || project.description}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t px-4 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
          <Link href={`/profile/${project.authorId || authorEmail}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {authorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm md:text-base text-muted-foreground">
              <div className="font-medium text-foreground">{authorName}</div>
              <div className="text-xs">{authorEmail}</div>
            </div>
          </Link>
          {onApply && (
            <Button 
              size="default"
              onClick={() => project._id && onApply(project._id)}
              className="w-full sm:w-auto h-10 md:h-11 text-sm md:text-base font-medium"
            >
              Apply Now
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
