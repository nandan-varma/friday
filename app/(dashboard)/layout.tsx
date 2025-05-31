import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex h-screen w-full">
      <DashboardSidebar>{children}</DashboardSidebar>
    </div>
  )
}
