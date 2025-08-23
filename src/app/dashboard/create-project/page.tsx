"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface ProjectFormData {
  title: string
  description: string
  logo: string
  logoFile: File | null
  requirements: string
  
  // Team composition
  teamSize: number | ""
  teamComposition: {
    developers: number | ""
    designers: number | ""
    marketers: number | ""
    commercials: number | ""
    others: number | ""
  }
  
  // Role-specific requirements
  developerRequirements: string
  designerRequirements: string
  marketerRequirements: string
  commercialRequirements: string
  
  techStack: string[]
  tags: string[]
  deadline: string
  budget: {
    min: number | ""
    max: number | ""
    currency: string
  }
  location: string
  category: string
  difficulty: string
  contactInfo: {
    email: string
    phone: string
    linkedin: string
    github: string
  }
}

export default function CreateProjectPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const projectIdFromParams = params.projectId as string
  const projectIdFromQuery = searchParams.get('projectId')
  const projectId = projectIdFromParams || projectIdFromQuery
  
  const isEditing = !!projectId

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    logo: "",
    logoFile: null,
    requirements: "",
    teamSize: "",
    teamComposition: {
      developers: "",
      designers: "",
      marketers: "",
      commercials: "",
      others: ""
    },
    developerRequirements: "",
    designerRequirements: "",
    marketerRequirements: "",
    commercialRequirements: "",
    techStack: [],
    tags: [],
    deadline: "",
    budget: {
      min: "",
      max: "",
      currency: "USD"
    },
    location: "Remote",
    category: "",
    difficulty: "",
    contactInfo: {
      email: "",
      phone: "",
      linkedin: "",
      github: ""
    }
  })
  const [logoPreview, setLogoPreview] = useState<string>("")

  const [newTech, setNewTech] = useState("")
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (isEditing && projectId) {
      fetchProjectData()
    }
  }, [isEditing, projectId])

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const project = await response.json()
        setFormData({
          title: project.title || "",
          description: project.description || "",
          logo: project.logo || "",
          logoFile: null,
          requirements: project.requirements || "",
          teamSize: project.teamSize || "",
          teamComposition: project.teamComposition || {
            developers: "",
            designers: "",
            marketers: "",
            commercials: "",
            others: ""
          },
          developerRequirements: project.developerRequirements || "",
          designerRequirements: project.designerRequirements || "",
          marketerRequirements: project.marketerRequirements || "",
          commercialRequirements: project.commercialRequirements || "",
          techStack: project.techStack || [],
          tags: project.tags || [],
          deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "",
          budget: {
            min: project.budget?.min || "",
            max: project.budget?.max || "",
            currency: project.budget?.currency || "USD"
          },
          location: project.location || "Remote",
          category: project.category || "",
          difficulty: project.difficulty || "",
          contactInfo: {
            email: project.contactInfo?.email || "",
            phone: project.contactInfo?.phone || "",
            linkedin: project.contactInfo?.linkedin || "",
            github: project.contactInfo?.github || ""
          }
        })
        if (project.logo) {
          setLogoPreview(project.logo)
        }
      } else {
        toast.error("Failed to load project data")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      toast.error("Failed to load project data")
      router.push("/dashboard")
    }
  }

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Logo file size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setFormData(prev => ({ ...prev, logoFile: file, logo: '' }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let logoUrl = formData.logo;
      
      // If logo file is selected, upload it first
      if (formData.logoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('logo', formData.logoFile);
        
        const uploadResponse = await fetch('/api/upload/project-logo', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload logo');
        }
        
        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.url;
      }

      const submitData = {
        ...formData,
        logo: logoUrl,
        teamSize: formData.teamSize ? Number(formData.teamSize) : undefined,
        teamComposition: {
          developers: formData.teamComposition.developers ? Number(formData.teamComposition.developers) : undefined,
          designers: formData.teamComposition.designers ? Number(formData.teamComposition.designers) : undefined,
          marketers: formData.teamComposition.marketers ? Number(formData.teamComposition.marketers) : undefined,
          commercials: formData.teamComposition.commercials ? Number(formData.teamComposition.commercials) : undefined,
          others: formData.teamComposition.others ? Number(formData.teamComposition.others) : undefined,
        },
        budget: {
          min: formData.budget.min ? Number(formData.budget.min) : undefined,
          max: formData.budget.max ? Number(formData.budget.max) : undefined,
          currency: formData.budget.currency
        }
      }

      const url = isEditing ? `/api/projects/${projectId}` : "/api/projects"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const message = isEditing ? "Project updated successfully!" : "Project created successfully!"
        toast.success(message)
        router.push("/dashboard")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to save project")
      }
    } catch (error) {
      console.error("Error saving project:", error)
      toast.error("Failed to save project")
    } finally {
      setLoading(false)
    }
  }

  const addTechStack = () => {
    if (newTech.trim() && !formData.techStack.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, newTech.trim()]
      }))
      setNewTech("")
    }
  }

  const removeTechStack = (index: number) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isEditing ? "Edit Project" : "Create New Project"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update your project details" : "Share your project and connect with developers"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide essential details about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Software">Software Development</SelectItem>
                        <SelectItem value="Mobile">Mobile Development</SelectItem>
                        <SelectItem value="Web Design">Web Design</SelectItem>
                        <SelectItem value="AI/ML">AI/ML</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Blockchain">Blockchain</SelectItem>
                        <SelectItem value="Game Development">Game Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Project Logo</Label>
                  <div className="space-y-2">
                    {/* Logo preview */}
                    {(logoPreview || formData.logo) && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src={logoPreview || formData.logo} 
                          alt="Logo preview" 
                          className="w-12 h-12 rounded object-cover border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, logoFile: null, logo: '' }));
                            setLogoPreview('');
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    {/* File upload */}
                    <div className="space-y-2">
                      <Label htmlFor="logoFile" className="text-sm text-muted-foreground">
                        Upload logo file (PNG, JPG, SVG - max 5MB)
                      </Label>
                      <Input
                        id="logoFile"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="cursor-pointer"
                      />
                    </div>
                    
                    {/* Or URL input */}
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl" className="text-sm text-muted-foreground">
                        Or provide logo URL
                      </Label>
                      <Input
                        id="logoUrl"
                        type="url"
                        placeholder="https://your-project.com/logo.png"
                        value={formData.logo}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, logo: e.target.value }));
                          if (formData.logoFile) {
                            setFormData(prev => ({ ...prev, logoFile: null }));
                            setLogoPreview('');
                          }
                          setLogoPreview(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project in detail"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder="What skills and experience are needed?"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Specify technical requirements and project scope
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Composition */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Team Composition</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="developers" className="text-sm">Developers</Label>
                      <Input
                        id="developers"
                        type="number"
                        min="0"
                        value={formData.teamComposition.developers}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          teamComposition: { ...prev.teamComposition, developers: e.target.value === "" ? "" : Number(e.target.value) }
                        }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designers" className="text-sm">Designers</Label>
                      <Input
                        id="designers"
                        type="number"
                        min="0"
                        value={formData.teamComposition.designers}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          teamComposition: { ...prev.teamComposition, designers: e.target.value === "" ? "" : Number(e.target.value) }
                        }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marketers" className="text-sm">Marketers</Label>
                      <Input
                        id="marketers"
                        type="number"
                        min="0"
                        value={formData.teamComposition.marketers}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          teamComposition: { ...prev.teamComposition, marketers: e.target.value === "" ? "" : Number(e.target.value) }
                        }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commercials" className="text-sm">Commercials</Label>
                      <Input
                        id="commercials"
                        type="number"
                        min="0"
                        value={formData.teamComposition.commercials}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          teamComposition: { ...prev.teamComposition, commercials: e.target.value === "" ? "" : Number(e.target.value) }
                        }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="others" className="text-sm">Others</Label>
                      <Input
                        id="others"
                        type="number"
                        min="0"
                        value={formData.teamComposition.others}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          teamComposition: { ...prev.teamComposition, others: e.target.value === "" ? "" : Number(e.target.value) }
                        }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize" className="text-sm">Total Team Size</Label>
                      <Input
                        id="teamSize"
                        type="number"
                        min="1"
                        value={formData.teamSize}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            teamSize: e.target.value === "" ? "" : Number(e.target.value)
                          }))
                        }
                        placeholder="Total people needed"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level *</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Remote, On-site, or City"
                    />
                  </div>
                </div>

                {/* Role-specific Requirements */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Role-specific Requirements</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="developerRequirements">Developer Requirements</Label>
                      <Textarea
                        id="developerRequirements"
                        value={formData.developerRequirements}
                        onChange={(e) => setFormData(prev => ({ ...prev, developerRequirements: e.target.value }))}
                        placeholder="What skills do developers need?"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designerRequirements">Designer Requirements</Label>
                      <Textarea
                        id="designerRequirements"
                        value={formData.designerRequirements}
                        onChange={(e) => setFormData(prev => ({ ...prev, designerRequirements: e.target.value }))}
                        placeholder="What design skills are needed?"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marketerRequirements">Marketer Requirements</Label>
                      <Textarea
                        id="marketerRequirements"
                        value={formData.marketerRequirements}
                        onChange={(e) => setFormData(prev => ({ ...prev, marketerRequirements: e.target.value }))}
                        placeholder="What marketing skills are needed?"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commercialRequirements">Commercial Requirements</Label>
                      <Textarea
                        id="commercialRequirements"
                        value={formData.commercialRequirements}
                        onChange={(e) => setFormData(prev => ({ ...prev, commercialRequirements: e.target.value }))}
                        placeholder="What commercial skills are needed?"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tech Stack</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="Add technology (e.g., React, Node.js)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                    />
                    <Button type="button" onClick={addTechStack} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.techStack.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTechStack(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag (e.g., Frontend, Backend)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline & Budget */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline & Budget</CardTitle>
                <CardDescription>
                  Set project timeline and budget expectations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Budget Min</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      min="0"
                      value={formData.budget.min}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        budget: { ...prev.budget, min: e.target.value === "" ? "" : Number(e.target.value) }
                      }))}
                      placeholder="Minimum budget"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Budget Max</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      min="0"
                      value={formData.budget.max}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        budget: { ...prev.budget, max: e.target.value === "" ? "" : Number(e.target.value) }
                      }))}
                      placeholder="Maximum budget"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={formData.budget.currency} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        budget: { ...prev.budget, currency: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="MAD">MAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  How can developers reach you?
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, email: e.target.value } }))}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, phone: e.target.value } }))}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.contactInfo.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, linkedin: e.target.value } }))}
                    placeholder="LinkedIn URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={formData.contactInfo.github}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, github: e.target.value } }))}
                    placeholder="GitHub URL"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
