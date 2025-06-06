import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import MinimizedChatWindow from "@/components/ai/minimized-chat-window"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <>
      <DashboardSidebar>{children}</DashboardSidebar>
      <MinimizedChatWindow />
    </>
  )
}
