"use client"

import * as React from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, Clock, ArrowRight, AtSign, User2, PencilLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type ContactSectionProps = {
    eyebrow?: string
    title?: string
    description?: string
    email?: string
    phone?: string
    address?: string
    hours?: string
    className?: string
}

export function ContactSection({
    eyebrow = "Contact",
    title = "Let's build the future",
    description = "Questions, ideas, or partnership inquiries? Send a message and we’ll respond shortly.",
    email = "hello@cofundry.io",
    phone = "+1 (415) 555-0134",
    address = "123 Builder Ave, San Francisco, CA",
    hours = "Mon–Fri, 9:00–18:00 PT",
    className = "",
}: ContactSectionProps) {
    const [loading, setLoading] = React.useState(false)
    const [form, setForm] = React.useState({ name: "", email: "", subject: "", message: "", company: "" }) // company = honeypot

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (form.company) return // bot
        if (!form.name || !form.email || !form.subject || !form.message) {
            toast.error("Please fill in all fields.")
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error("Failed")
            toast.success("Thanks! Your message has been sent.")
            setForm({ name: "", email: "", subject: "", message: "", company: "" })
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section
            id="contact"
            className={`relative py-24 sm:py-28 ${className}`}
        >
            {/* --- Futuristic background layer --- */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                {/* subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.25] dark:opacity-40"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />
                {/* radial glow blobs */}
                <div className="absolute -top-40 left-[-10%] h-[38rem] w-[38rem] rounded-full blur-3xl"
                    style={{ background: "radial-gradient(closest-side, hsl(var(--primary)) 0%, transparent 70%)", opacity: .25 }} />
                <div className="absolute -bottom-40 right-[-10%] h-[34rem] w-[34rem] rounded-full blur-3xl"
                    style={{ background: "radial-gradient(closest-side, hsl(var(--primary)) 0%, transparent 70%)", opacity: .18 }} />
                {/* rotating ring */}
                <div className="absolute left-1/2 top-10 h-[42rem] w-[42rem] -translate-x-1/2 opacity-30 motion-safe:animate-[spin_30s_linear_infinite]">
                    <div className="h-full w-full rounded-full"
                        style={{ boxShadow: "0 0 120px 20px hsl(var(--primary)/.18) inset, 0 0 120px 8px hsl(var(--primary)/.12)" }} />
                </div>
            </div>

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium 
                           border-white/10 bg-white/5 text-foreground/80 backdrop-blur-sm shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_12px_hsl(var(--primary))]" />
                        {eyebrow}
                    </span>
                    <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
                        {title}
                    </h2>
                    {description && <p className="mt-4 text-base sm:text-lg text-muted-foreground/90">{description}</p>}
                </div>

                {/* Content */}
                <div className="mt-12 grid gap-8 lg:grid-cols-2">
                    {/* Left — info card */}
                    <div className="group relative">
                        {/* neon border */}
                        <div className="absolute -inset-0.5 rounded-3xl bg-[conic-gradient(from_180deg_at_50%_50%,hsl(var(--primary))_0deg,transparent_120deg,hsl(var(--primary))_240deg,transparent_360deg)] 
                            opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-90" />
                        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl">
                            <h3 className="text-lg font-semibold">Contact information</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                We usually respond within one business day.
                            </p>

                            <ul className="mt-6 space-y-4 text-sm">
                                <li className="flex items-start gap-3">
                                    <Mail className="mt-0.5 size-4 text-[hsl(var(--primary))]" />
                                    <Link href={`mailto:${email}`} className="hover:underline underline-offset-4">
                                        {email}
                                    </Link>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Phone className="mt-0.5 size-4 text-[hsl(var(--primary))]" />
                                    <Link href={`tel:${phone}`} className="hover:underline underline-offset-4">
                                        {phone}
                                    </Link>
                                </li>
                                <li className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 size-4 text-[hsl(var(--primary))]" />
                                    <span>{address}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Clock className="mt-0.5 size-4 text-[hsl(var(--primary))]" />
                                    <span>{hours}</span>
                                </li>
                            </ul>

                            <div className="mt-8 rounded-xl border border-white/10 bg-background/60 p-4">
                                <p className="text-sm text-muted-foreground">
                                    Prefer email? Send us a note and include relevant links or attachments.
                                </p>
                            </div>

                            {/* quick actions */}
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href={`mailto:${email}`}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium backdrop-blur hover:bg-white/10"
                                >
                                    <AtSign className="size-3.5" />
                                    Email us
                                </Link>
                                <Link
                                    href={`tel:${phone}`}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium backdrop-blur hover:bg-white/10"
                                >
                                    <Phone className="size-3.5" />
                                    Call now
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right — form card */}
                    <form
                        onSubmit={onSubmit}
                        className="group relative border rounded-2xl"
                    >

                        {/* neon border */}
                        <div className="absolute -inset-0.5 rounded-3xl bg-[conic-gradient(from_0deg_at_50%_50%,transparent,transparent, hsl(var(--primary)), transparent,transparent)] 
                            opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-90" />
                        <fieldset
                            disabled={loading}
                            className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.04] p-6 sm:p-8 backdrop-blur-xl"
                        >
                            <legend className="sr-only">Contact form</legend>
                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Name */}
                                <div className="sm:col-span-1">
                                    <Label htmlFor="name">Name</Label>
                                    <div className="relative mt-1">
                                        <User2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                                        <Input
                                            id="name"
                                            name="name"
                                            autoComplete="name"
                                            value={form.name}
                                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                            placeholder="Jane Doe"
                                            required
                                            className="pl-9 bg-white/5 border-white/10 focus-visible:ring-[hsl(var(--primary))]"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="sm:col-span-1">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative mt-1">
                                        <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={form.email}
                                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                            placeholder="jane@company.com"
                                            required
                                            className="pl-9 bg-white/5 border-white/10 focus-visible:ring-[hsl(var(--primary))]"
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <div className="relative mt-1">
                                        <PencilLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                                        <Input
                                            id="subject"
                                            name="subject"
                                            value={form.subject}
                                            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                                            placeholder="I want to collaborate on…"
                                            required
                                            className="pl-9 bg-white/5 border-white/10 focus-visible:ring-[hsl(var(--primary))]"
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="message">Message</Label>
                                    <div className="relative mt-1">
                                        <Textarea
                                            id="message"
                                            name="message"
                                            rows={6}
                                            value={form.message}
                                            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                            placeholder="Tell us a bit about your project or question…"
                                            required
                                            className="bg-white/5 border-white/10 focus-visible:ring-[hsl(var(--primary))] min-h-[9rem]"
                                        />
                                        {/* subtle corner glow */}
                                        <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 rounded-full bg-[hsl(var(--primary))] opacity-70 blur-[6px]" />
                                    </div>
                                </div>

                                {/* Honeypot */}
                                <input
                                    type="text"
                                    name="company"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    className="hidden"
                                    value={form.company}
                                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-full shadow-[0_0_0_1px_rgba(255,255,255,.06)_inset,0_8px_30px_rgba(0,0,0,.2)]"
                                >
                                    {loading ? "Sending…" : "Send message"}
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    We’ll never share your info.
                                </p>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        </section>
    )
}
