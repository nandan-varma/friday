"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Settings, MessageSquare, Bell, Search, PackagePlus } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import { AccountMenu } from "@/components/account-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Navigation data for Friday AI Calendar
const navData = {
  mainNavigation: [
    {
      icon: Home,
      title: "Dashboard",
      url: "/dashboard",
    },
    {
      icon: Calendar,
      title: "Calendar",
      url: "/calendar",
    },
    {
      icon: MessageSquare,
      title: "AI Assistant",
      url: "/ai",
    },
    {
      icon: Bell,
      title: "Notifications",
      url: "/notifications",
    },
    {
      icon: Search,
      title: "Search",
      url: "/search",
    },
    {
      icon: Settings,
      title: "Settings",
      url: "/settings",
    },
    {
      icon: PackagePlus,
      title: "Integrations",
      url: "/integrations",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Friday</span>
        </div>
        <AccountMenu />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navData.mainNavigation.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
