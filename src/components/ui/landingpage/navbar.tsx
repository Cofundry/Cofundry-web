"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, LogIn, UserPlus } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: React.ReactNode
  items?: MenuItem[]
}

interface Navbar1Props {
  logo?: {
    url: string
    src?: string
    alt?: string
    title: string
  }
  menu?: MenuItem[]
  auth?: {
    login: { title: string; url: string }
    signup: { title: string; url: string }
  }
}

const Navbar1 = ({
  logo = {
    url: "/",
    src: "/cofundry.png", // <-- put cofundry.png in /public
    alt: "Cofundry logo",
    title: "Cofundry",
  },
  menu = [
    { title: "Home", url: "/" },
    { title: "Projects", url: "/projects" },
    { title: "Products", url: "/saas" },
  ],
  auth = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/register" },
  },
}: Navbar1Props) => {
  const [scrolled, setScrolled] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/"
    return pathname === url || pathname.startsWith(url + "/")
  }

  return (
    <header
      role="banner"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-background/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-border/50 shadow-sm"
          : "bg-transparent"
        }`}
    >
      <nav className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Primary">
        {/* Desktop */}
        <div className="hidden lg:flex items-center justify-between py-3">
          {/* Left: logo + brand + links */}
          <div className="flex items-center gap-6">
            <Link href={logo.url} className="flex items-center gap-2 group">
              {logo.src && (
                <Image
                  src={logo.src}
                  alt={logo.alt ?? "logo"}
                  width={28}
                  height={28}
                  priority
                  className="h-7 w-7 rounded-sm object-contain"
                />
              )}
              <span className="text-lg font-semibold tracking-tight">{logo.title}</span>
            </Link>

            {/* Links */}
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItemMinimalUnderline(item, isActive))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right: auth */}
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full pl-3 pr-3">
              <Link href={auth.login.url} aria-label={auth.login.title}>
                <LogIn className="mr-2 size-4" aria-hidden="true" />
                {auth.login.title}
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full pl-4 pr-4 bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-sm hover:brightness-110"
            >
              <Link href={auth.signup.url} aria-label={auth.signup.title}>
                <UserPlus className="mr-2 size-4" aria-hidden="true" />
                {auth.signup.title}
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex lg:hidden items-center justify-between py-3">
          <Link href={logo.url} className="flex items-center gap-2">
            {logo.src && (
              <Image
                src={logo.src}
                alt={logo.alt ?? "logo"}
                width={24}
                height={24}
                priority
                className="h-6 w-6 rounded-sm object-contain"
              />
            )}
            <span className="text-base font-semibold tracking-tight">{logo.title}</span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu" className="rounded-full">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="overflow-y-auto bg-background/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur"
            >
              <SheetHeader>
                <SheetTitle>
                  <Link href={logo.url} className="flex items-center gap-2">
                    {logo.src && (
                      <Image
                        src={logo.src}
                        alt={logo.alt ?? "logo"}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-sm object-contain"
                      />
                    )}
                    <span className="text-lg font-semibold tracking-tight">{logo.title}</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 p-4">
                <Accordion type="single" collapsible className="flex w-full flex-col gap-1">
                  {menu.map((item) => renderMobileMenuItemMinimalUnderline(item, isActive))}
                </Accordion>

                <div className="flex flex-col gap-3">
                  <Button asChild variant="outline" className="rounded-full pl-3 pr-3">
                    <Link href={auth.login.url}>
                      <LogIn className="mr-2 size-4" aria-hidden="true" />
                      {auth.login.title}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="rounded-full pl-4 pr-4 bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-sm hover:brightness-110"
                  >
                    <Link href={auth.signup.url}>
                      <UserPlus className="mr-2 size-4" aria-hidden="true" />
                      {auth.signup.title}
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

/* -------- Helpers (minimal 1px underline with scoped hover) -------- */

const BaseLink = ({
  href,
  children,
  active,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
}) => (
  <Link
    href={href}
    aria-current={active ? "page" : undefined}
    data-active={active ? "true" : undefined}
    // NOTE: group/nav scopes hover to THIS link only (prevents "all items underline" bug)
    className="relative group/nav inline-flex items-center h-10 px-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
  >
    <span className="px-3">{children}</span>
    {/* 1px underline that animates per-item */}
    <span
      className={[
        "pointer-events-none absolute inset-x-3 bottom-1 h-px w-0 bg-foreground/70 transition-all duration-200",
        "group-hover/nav:w-full", // only when THIS link is hovered
        "data-[active=true]:w-full", // keep it when active
      ].join(" ")}
    />
  </Link>
)

/** Desktop items: either trigger (has children) or simple link with 1px underline */
const renderMenuItemMinimalUnderline = (
  item: MenuItem,
  isActive: (url: string) => boolean
) => {
  if (item.items && item.items.length) {
    return (
      <NavigationMenuItem key={item.title}>
        {/* scope underline to this trigger only */}
        <NavigationMenuTrigger className="group/trig bg-transparent data-[state=open]:bg-muted/40">
          <span className="relative">
            {item.title}
            <span
              className={[
                "pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-foreground/70 transition-all duration-200",
                "group-hover/trig:w-full",
                "data-[state=open]:w-full",
              ].join(" ")}
            />
          </span>
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground z-[60]">
          <div className="grid w-[420px] gap-2 p-4">
            {item.items.map((subItem) => (
              <NavigationMenuLink asChild key={subItem.title}>
                <SubMenuLink item={subItem} />
              </NavigationMenuLink>
            ))}
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink asChild>
        <BaseLink href={item.url} active={isActive(item.url)}>
          {item.title}
        </BaseLink>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

const renderMobileMenuItemMinimalUnderline = (
  item: MenuItem,
  isActive: (url: string) => boolean
) => {
  if (item.items && item.items.length) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-base py-2 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-1">
          <div className="flex flex-col gap-1">
            {item.items.map((subItem) => (
              <SubMenuLink key={subItem.title} item={subItem} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    )
  }
  return (
    <Link
      key={item.title}
      href={item.url}
      data-active={isActive(item.url) ? "true" : undefined}
      className="relative text-base font-medium py-2 rounded-md px-2 transition hover:bg-muted/50"
    >
      <span>{item.title}</span>
      <span className="pointer-events-none absolute left-2 right-2 bottom-1 h-px w-0 bg-foreground/70 transition-all duration-200 group-hover/nav:w-0 hover:w-[calc(100%-1rem)] data-[active=true]:w-[calc(100%-1rem)]" />
    </Link>
  )
}

const SubMenuLink = ({ item }: { item: MenuItem }) => (
  <Link
    href={item.url}
    className="flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted/60 focus:bg-accent/60"
  >
    {item.icon && <div className="text-foreground/80">{item.icon}</div>}
    <div>
      <div className="text-sm font-semibold">{item.title}</div>
      {item.description && <p className="text-sm leading-snug text-muted-foreground">{item.description}</p>}
    </div>
  </Link>
)

export { Navbar1 }
