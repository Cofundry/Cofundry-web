"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  FileText,
  Frame,
  Key,
  LifeBuoy,
  Map,
  MessageSquare,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Database,
  Paintbrush,
  Zap,
  Building2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSelector } from "react-redux"
import { title } from "process"
import { usePathname } from "next/navigation";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    
    },
    {
      title: "bots",
      url: "/dashboard/bots",
      icon: Bot,
    
    },
      {
        title: "credentials",
        url: "/dashboard/credentials",
        icon: Key,
      
      },
      {
        title: "chatlogs",
        url: "/dashboard/chatlogs",
        icon: MessageSquare,
      
      },
      {
        title:"collections",
        url:"/dashboard/collections",
        icon:Database,
      
      },
      {
        title: "actions",
        url: "/dashboard/actions",
        icon: Frame,
      },
      {
        title: "Integrations",
        url: "/dashboard/Integrations",
        icon: Zap,
      },
      {
        title: "SaaS",
        url: "/dashboard/saas",
        icon: Building2,
      },
  
   
   
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  // Dynamically set isActive based on current path
  const navItems = data.navMain.map(item => ({
    ...item,
    isActive: pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url)),
  }));
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <div className="text-2xl font-bold px-4 py-6">BotsCrafts.</div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
             
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
     
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
