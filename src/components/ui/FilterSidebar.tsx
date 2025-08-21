"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

interface FilterSidebarProps {
  search: string
  category: string
  difficulty: string
  location: string
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onDifficultyChange: (value: string) => void
  onLocationChange: (value: string) => void
  onClearFilters: () => void
}

const categories = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'ai-ml', label: 'AI & Machine Learning' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'game-development', label: 'Game Development' },
  { value: 'other', label: 'Other' }
]

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

const locations = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' }
]

export function FilterSidebar({
  search,
  category,
  difficulty,
  location,
  onSearchChange,
  onCategoryChange,
  onDifficultyChange,
  onLocationChange,
  onClearFilters
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasActiveFilters = search || category || difficulty || location

  const handleClearFilters = () => {
    onClearFilters()
    setIsOpen(false)
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <Label htmlFor="search" className="text-base font-medium">Search Projects</Label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by title, description, or tags..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <Label htmlFor="category" className="text-base font-medium">Category</Label>
        <Select value={category || "all"} onValueChange={(value) => onCategoryChange(value === "all" ? "" : value)}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="h-12 text-base">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value} className="h-12 text-base">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-3">
        <Label htmlFor="difficulty" className="text-base font-medium">Difficulty Level</Label>
        <Select value={difficulty || "all"} onValueChange={(value) => onDifficultyChange(value === "all" ? "" : value)}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="h-12 text-base">All Difficulties</SelectItem>
            {difficulties.map((diff) => (
              <SelectItem key={diff.value} value={diff.value} className="h-12 text-base">
                {diff.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Filter */}
      <div className="space-y-3">
        <Label htmlFor="location" className="text-base font-medium">Location</Label>
        <Select value={location || "all"} onValueChange={(value) => onLocationChange(value === "all" ? "" : value)}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="h-12 text-base">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.value} value={loc.value} className="h-12 text-base">
                {loc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Active Filters</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge variant="secondary" className="text-xs">
                Search: {search}
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {category && (
              <Badge variant="secondary" className="text-xs">
                {categories.find(c => c.value === category)?.label}
                <button
                  onClick={() => onCategoryChange('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {difficulty && (
              <Badge variant="secondary" className="text-xs">
                {difficulties.find(d => d.value === difficulty)?.label}
                <button
                  onClick={() => onDifficultyChange('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {location && (
              <Badge variant="secondary" className="text-xs">
                {locations.find(l => l.value === location)?.label}
                <button
                  onClick={() => onLocationChange('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-auto p-1 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full h-12 text-base font-medium">
              <Filter className="h-5 w-5 mr-3" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-6 w-6 p-0 text-xs font-semibold">
                  {[search, category, difficulty, location].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] max-h-[90vh] rounded-t-3xl">
            <div className="flex flex-col h-full">
              {/* Handle Bar */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>
              
              {/* Header */}
              <SheetHeader className="text-left pb-4 border-b">
                <SheetTitle className="text-xl font-bold">Filter Projects</SheetTitle>
                <p className="text-sm text-muted-foreground">Find the perfect project for you</p>
              </SheetHeader>
              
              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto py-6 px-1">
                <FilterContent />
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="border-t pt-4 space-y-3">
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={handleClearFilters}
                    className="w-full h-12 text-base font-medium"
                  >
                    Clear All Filters
                  </Button>
                )}
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="w-full h-12 text-base font-medium"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
