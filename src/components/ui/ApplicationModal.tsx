"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface ApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
}

export function ApplicationModal({ isOpen, onClose, projectId, projectTitle }: ApplicationModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    coverLetter: "",
    portfolio: "",
    github: "",
    linkedin: "",
    experience: "",
    availability: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          ...formData
        }),
      })

      if (response.ok) {
        toast.success("Application submitted successfully! The project owner will review your application.")
        setFormData({
          coverLetter: "",
          portfolio: "",
          github: "",
          linkedin: "",
          experience: "",
          availability: ""
        })
        onClose()
      } else {
        const error = await response.json()
        if (error.error === "Already applied") {
          toast.error("You have already applied to this project!")
        } else {
          toast.error(error.error || "Failed to submit application")
        }
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to Project</DialogTitle>
          <DialogDescription>
            Submit your application for "{projectTitle}". Fill out the form below to showcase your skills and experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => handleInputChange("coverLetter", e.target.value)}
              placeholder="Tell us why you're interested in this project and what you can bring to the team..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Relevant Experience *</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              placeholder="Describe your relevant experience, skills, and past projects..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability *</Label>
            <Textarea
              id="availability"
              value={formData.availability}
              onChange={(e) => handleInputChange("availability", e.target.value)}
              placeholder="How many hours per week can you dedicate? What's your timeline?"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input
                id="portfolio"
                type="url"
                value={formData.portfolio}
                onChange={(e) => handleInputChange("portfolio", e.target.value)}
                placeholder="https://your-portfolio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github">GitHub Profile</Label>
              <Input
                id="github"
                type="url"
                value={formData.github}
                onChange={(e) => handleInputChange("github", e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <Input
              id="linkedin"
              type="url"
              value={formData.linkedin}
              onChange={(e) => handleInputChange("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
