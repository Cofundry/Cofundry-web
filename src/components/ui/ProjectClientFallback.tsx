"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Props = { id: string }

export default function ProjectClientFallback({ id }: Props) {
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/projects/${encodeURIComponent(id)}`)
        if (!res.ok) {
          setError(`Failed to load project (status ${res.status})`)
          return
        }
        const data = await res.json()
        if (!cancelled) setProject(data)
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Unknown error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  if (loading) return <div className="container px-4 py-8">Loading project...</div>
  if (error) return (
    <div className="container px-4 py-8">
      <h2 className="text-xl font-semibold">Project not found on server</h2>
      <p className="mt-2 text-sm text-muted-foreground">Tried fetching project <strong>{id}</strong> from the server but got an error:</p>
      <pre className="mt-2 bg-black/5 p-3 rounded">{error}</pre>
      <div className="mt-4 flex gap-2">
        <Button asChild>
          <a href="/projects">Back to projects</a>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    </div>
  )

  if (!project) return (
    <div className="container px-4 py-8">
      <h2 className="text-xl font-semibold">Project not found</h2>
      <p className="mt-2 text-sm text-muted-foreground">No project data was returned for id <strong>{id}</strong>.</p>
      <div className="mt-4">
        <Button asChild>
          <a href="/projects">Back to projects</a>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="container px-4 py-8">
      <h1 className="text-2xl font-bold">{project.title || project.name || 'Project'}</h1>
      <p className="mt-2 text-muted-foreground">{project.description || project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(project.tags || []).map((t: string) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
      <div className="mt-6">
        <Button asChild>
          <a href={`/projects/${encodeURIComponent(id)}`}>Open canonical project URL</a>
        </Button>
      </div>
    </div>
  )
}
