import ProjectDetailsPage from "@/app/projects/[id]/page"

export default async function DashboardSaaSPage({ params }: any) {
  // For now reuse the project details template for SaaS items; adjust later to use SaaS-specific fields
  return ProjectDetailsPage({ params: { id: params.saasId } })
}
