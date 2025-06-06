"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Plus, Settings, MessageSquare, Bell, Search, LogOut, PackagePlus } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const routes = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: Calendar,
      label: "Calendar",
      href: "/calendar",
    },
    {
      icon: MessageSquare,
      label: "AI Assistant",
      href: "/ai",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/notifications",
    },
    {
      icon: Search,
      label: "Search",
      href: "/search",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
    {
      icon: PackagePlus,
      label: "Integrations",
      href: "/integrations",
    }
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader className="flex flex-col items-center justify-center p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Friday</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.label}>
                    <Link href={route.href}>
                      <route.icon className="h-5 w-5" />
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/logout">
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="flex h-16 items-center border-b px-4">
            <SidebarTrigger />
            <div className="ml-4 text-lg font-medium">
              {routes.find((route) => route.href === pathname)?.label || "Friday - AI Calendar"}
            </div>
          </div>
          <main className="p-4 w-full h-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
