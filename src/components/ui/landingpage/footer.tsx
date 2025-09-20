"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowUpRight, ChevronUp
} from "lucide-react"

interface FooterLink { name: string; href: string }
interface FooterSection { title: string; links: FooterLink[] }

interface Footer7Props {
  logo?: { url: string; src?: string; alt?: string; title: string }
  description?: string
  sections?: FooterSection[]
  legalLinks?: FooterLink[]
  socialLinks?: { icon: React.ReactNode; href: string; label: string }[]
  contact?: { email?: string; phone?: string; address?: string }
  copyright?: string
  /** extra classes for background theming */
  className?: string
}

const defaultSections: FooterSection[] = [
  { title: "Quick Links", links: [{ name: "Home", href: "/" }, { name: "Projects", href: "/projects" }, { name: "Products", href: "/saas" }] },
  { title: "Company", links: [{ name: "Documentation", href: "/docs" }, { name: "FAQ", href: "/faq" }, { name: "Support", href: "/support" }] },
  { title: "Legal", links: [{ name: "Terms of Service", href: "/terms" }, { name: "Privacy Policy", href: "/privacy" }, { name: "Cookie Policy", href: "/cookies" }] },
]

const defaultSocial = [
  { icon: <Facebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <Twitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <Linkedin className="size-5" />, href: "#", label: "LinkedIn" },
  { icon: <Instagram className="size-5" />, href: "#", label: "Instagram" },
]

export function Footer7({
  logo = { url: "/", title: "Cofundry" },
  description = "Cofundry helps builders discover, back, and collaborate on real projects.",
  sections = defaultSections,
  legalLinks = [{ name: "Terms of Service", href: "/terms" }, { name: "Privacy Policy", href: "/privacy" }],
  socialLinks = defaultSocial,
  contact = { email: "hello@cofundry.io", phone: "+1 (555) 123-4567", address: "123 Builder Ave, SF, CA" },
  copyright = `© ${new Date().getFullYear()} Cofundry. All rights reserved.`,
  className = "",
}: Footer7Props) {
  const [email, setEmail] = React.useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // hook up to your API later; for now just clear the field
    setEmail("")
  }

  return (
    <footer
      className={[
        // dark futuristic canvas with subtle primary tint — change hues by tweaking bg classes
        "relative overflow-hidden text-white",
        "bg-[#0b0c1a] bg-[radial-gradient(1200px_500px_at_-200px_-200px,rgba(99,102,241,0.18),transparent),radial-gradient(900px_400px_at_110%_120%,rgba(168,85,247,0.12),transparent)]",
        className,
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Top grid */}
        <div className="grid gap-10 md:gap-12 lg:grid-cols-5">
          {/* Brand + contact (spans 2 on lg) */}
          <div className="lg:col-span-2">
            <Link href={logo.url} className="inline-flex items-center gap-2">
              {logo.src ? (
                // if you prefer next/image, swap here
                <img src={logo.src} alt={logo.alt ?? "logo"} className="h-7 w-7 rounded-sm object-contain" />
              ) : null}
              <span className="text-xl font-semibold tracking-tight">{logo.title}</span>
            </Link>

            <p className="mt-4 max-w-md text-sm/6 text-white/70">
              {description}
            </p>

            <div className="mt-6 space-y-3 text-sm/6 text-white/80">
              {contact.email && (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 text-white/60" />
                  <Link href={`mailto:${contact.email}`} className="hover:text-white transition">{contact.email}</Link>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 text-white/60" />
                  <Link href={`tel:${contact.phone}`} className="hover:text-white transition">{contact.phone}</Link>
                </div>
              )}
              {contact.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-white/60" />
                  <span>{contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Link columns */}
          {sections.map((section) => (
            <nav key={section.title} aria-labelledby={`foot-${section.title}`} className="min-w-[10rem]">
              <h3 id={`foot-${section.title}`} className="text-sm font-semibold text-white/90">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {section.links.map((l) => (
                  <li key={l.name}>
                    <Link
                      href={l.href}
                      className="text-white/70 hover:text-white transition inline-flex items-center gap-1"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

         
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-white/10 pt-6" />

        {/* Bottom bar */}
        <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/60">{copyright}</p>
          <div className="flex items-center gap-4">
            {socialLinks.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                {s.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>

      
    </footer>

  )
}

export default Footer7
