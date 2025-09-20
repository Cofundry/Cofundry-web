"use client"

import { useState, useEffect } from "react"
import Hero from "@/components/ui/landingpage/hero"
import { Footer7 } from "@/components/ui/landingpage/footer"
import { Navbar1 } from "@/components/ui/landingpage/navbar"
import { Project } from "@/lib/models/Project"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLoading } from "@/components/ui/LoadingProvider"
import { FAQSection } from "@/components/ui/landingpage/faq"
import { homeFaqs } from "@/lib/types/landing-data"
import { FeaturedProjects } from "@/components/ui/landingpage/featured-projects"
import { ContactSection } from "@/components/ui/landingpage/contact"
import { BackToTop } from "@/components/ui/landingpage/backtoup"

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

export default function HomePage() {
  const router = useRouter()
  const { setLoading } = useLoading()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLocalLoading] = useState(true)

  // --- Fetch only top 6 (by likes desc if available, else latest) ---
  const fetchProjects = async () => {
    setLocalLoading(true)
    setLoading(true)
    try {
      // If your API supports sorting, keep the `sort` param.
      const res = await fetch(`/api/projects?limit=6&sort=likes_desc`, { cache: "no-store" })
      if (res.ok) {
        const data: ProjectsResponse = await res.json()
        let list = data.projects ?? []

        // Fallback client sort if API ignores `sort`
        list = [...list].sort((a: any, b: any) => (b?.likes ?? 0) - (a?.likes ?? 0))
        setProjects(list.slice(0, 6))
      } else {
        setProjects([])
      }
    } catch (e) {
      console.error(e)
      setProjects([])
    } finally {
      setLocalLoading(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])


  function getProjectId(p: any): string {
    const raw = p?.slug ?? p?.id ?? p?._id
    if (!raw) return ""
    if (typeof raw === "string") return raw
    if (typeof raw === "object") return raw?.$oid ?? raw?.toString?.() ?? ""
    return String(raw)
  }

  // Keep your apply behavior (login gate)
  const handleApply = (project: Project) => {
    toast.info("Please log in to apply for projects")
    router.push("/login")
  }

  return (
    <>
      {/* Schema.org Structured Data (unchanged) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Cofundry",
            description:
              "The premier platform for students, SaaS developers, and professionals to collaborate on innovative projects",
            url: "https://cofundry.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://cofundry.com/projects?search={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            publisher: {
              "@type": "Organization",
              name: "Cofundry",
              logo: { "@type": "ImageObject", url: "https://cofundry.com/ChatGPT Image Aug 22, 2025, 05_05_35 PM.png" },
            },
          }),
        }}
      />

      <div className="min-h-screen bg-background">
        <header>
          <Navbar1 />
        </header>

        <main>
          <Hero />

          {/* Projects Cards */}
          <FeaturedProjects
            title="Popular Projects"
            subtitle="A quick taste of what’s trending. Browse all to use filters."
            limit={6}
            sort="likes_desc"
            ctaHref="/projects"
            ctaLabel="Browse all projects"
          />

          {/* FAQ (unchanged) */}
          <FAQSection
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            highlight="Questions"
            description="Find answers to common questions about Cofundry and how it helps you collaborate on projects."
            items={homeFaqs}
            initiallyVisible={6}
            multipleOpen
            openFirst
            ctaHref="/faq"
            ctaLabel="Visit Our Help Center"
          />
        </main>

        {/* Contact section */}
        <ContactSection
          eyebrow="Contact"
          title="Let’s build together"
          description="Drop us a note about your product or the kind of project you’re looking for."
          email="contact@cofundry.io"
          phone="+1 (415) 555-0134"
          address="123 Builder Ave, San Francisco, CA"
          hours="Mon–Fri, 9:00–18:00 PT"
        />

        <Footer7
          className="bg-[#08111f] bg-[radial-gradient(1200px_500px_at_-200px_-200px,hsl(var(--primary)/0.18),transparent),radial-gradient(900px_400px_at_110%_120%,hsl(var(--primary)/0.12),transparent)]"
          sections={[
            { title: "Quick Links", links: [{ name: "Home", href: "/" }, { name: "Projects", href: "/projects" }, { name: "Products", href: "/saas" }] },
            { title: "Company", links: [{ name: "FAQ", href: "/faq" }, { name: "Support", href: "/support" }, { name: "Careers", href: "/careers" }] },
            { title: "Legal", links: [{ name: "Terms", href: "/terms" }, { name: "Privacy", href: "/privacy" }, { name: "Cookie Policy", href: "/cookies" }] },
          ]}
          contact={{ email: "cofundry@gmail.com", phone: "+1 (415) 555-0134", address: "123 Builder Ave, San Francisco, CA" }}
        />

        <BackToTop threshold={200} />

      </div>
    </>
  )
}
