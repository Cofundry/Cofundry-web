"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  useEffect(() => {
    if (projectId) {
      router.replace(`/dashboard/create-project?projectId=${projectId}`)
    } else {
      router.replace("/dashboard")
    }
  }, [projectId, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to edit project...</p>
      </div>
    </div>
  )
}
