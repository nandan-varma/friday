import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import MinimizedChatWindow from "@/components/ai/minimized-chat-window"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex h-screen w-full">
      <DashboardSidebar>{children}</DashboardSidebar>
      <MinimizedChatWindow />
    </div>
  )
}
