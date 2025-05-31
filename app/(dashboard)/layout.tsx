import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
        headers: await headers()
    })

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen w-full">
      <DashboardSidebar>{children}</DashboardSidebar>
    </div>
  )
}
