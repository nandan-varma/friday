import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { getUserFromCookie } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserFromCookie()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen w-full">
      <DashboardSidebar>{children}</DashboardSidebar>
    </div>
  )
}
