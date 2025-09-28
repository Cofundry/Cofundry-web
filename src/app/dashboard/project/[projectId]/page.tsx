import ProjectDetailsPage from "@/app/projects/[id]/page"

export default async function DashboardProjectPage({ params }: any) {
  // Reuse the existing project page component so the dashboard can show the same details
  return ProjectDetailsPage({ params: { id: params.projectId } })
}
