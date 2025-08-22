"use client"

import { Calendar, MapPin, Users, Code, DollarSign, User, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Project } from "@/lib/models/Project"
import { CommentModal } from "@/components/ui/CommentModal"
import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"

interface ProjectCardProps {
  project: Project;
  onApply?: (project: Project) => void;
  currentUser?: { id: string; name: string; email: string; avatar?: string };
  showEditDelete?: boolean;
  onEdit?: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onApply, currentUser, showEditDelete, onEdit, onDelete }: ProjectCardProps) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState<Array<{
    _id: string;
    projectId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar?: string;
    text: string;
    createdAt: string;
    updatedAt: string;
  }>>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/comments?projectId=${project._id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    }
    setLoadingComments(false);
  };

  useEffect(() => {
    if (commentOpen) fetchComments();
    // eslint-disable-next-line
  }, [commentOpen]);

  const handleAddComment = async (text: string) => {
    if (!currentUser) {
      toast.error("Please log in to comment");
      return;
    }
    
    try {
      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          projectId: project._id, 
          text, 
          avatar: currentUser.avatar 
        })
      });
      
      if (response.ok) {
        toast.success("Comment added successfully!");
        fetchComments();
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

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
  const displayDescription = project.description || 'No description available'
  const displayRequirements = project.requirements || project.description || 'No requirements specified'
  const displayCategory = project.category || 'Other'
  const displayDifficulty = project.difficulty || 'Not specified'
  const displayLocation = project.location || 'Not specified'
  const displayDeadline = formatDate(project.deadline)
  const teamSize = project.teamSize
  const techList = project.techStack || []

  // Author information with proper fallbacks
  const authorName = project.authorName || 'Anonymous User'
  const authorEmail = project.authorEmail || 'user@example.com'
  const authorAvatar = project.authorAvatar || ''
  const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleDelete = async () => {
    if (!onDelete || !project._id) return;
    
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      onDelete(project._id);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      {/* Edit/Delete buttons for project owner */}
      {showEditDelete && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => project._id && onEdit?.(project._id)}
            className="bg-white/90 hover:bg-white"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="bg-red-500/90 hover:bg-red-500 text-white"
          >
            Delete
          </Button>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg md:text-xl font-bold line-clamp-2 leading-tight">
              {displayTitle}
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
              {displayDescription}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Category and Difficulty Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={`px-3 py-1.5 text-xs md:text-sm font-medium ${getCategoryColor(displayCategory)}`}>
            {displayCategory}
          </Badge>
          <Badge className={`px-3 py-1.5 text-xs md:text-sm font-medium ${getDifficultyColor(displayDifficulty)}`}>
            {displayDifficulty}
          </Badge>
        </div>

        {/* Tech Stack */}
        {techList.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm md:text-base font-medium text-foreground">
              <Code className="h-4 w-4 md:h-5 md:w-5" />
              Tech Stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {techList.slice(0, 3).map((tech: string, index: number) => (
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
            <p className="line-clamp-2 mt-2 leading-relaxed">{displayRequirements}</p>
          </div>
        )}
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
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="ghost" size="icon" onClick={() => setCommentOpen(true)} title="Comments">
              <MessageCircle className="w-5 h-5" />
            </Button>
            {onApply && (
              <Button 
                size="default"
                onClick={() => onApply(project)}
                className="h-10 md:h-11 text-sm md:text-base font-medium"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
        <CommentModal
          open={commentOpen}
          onOpenChange={setCommentOpen}
          onSubmit={currentUser ? handleAddComment : undefined}
          comments={comments}
          currentUser={currentUser?.name || currentUser?.email}
          currentUserAvatar={currentUser?.avatar}
          projectId={project._id || ""}
          loading={loadingComments}
          refetchComments={fetchComments}
        />
      </CardFooter>
    </Card>
  )
}
