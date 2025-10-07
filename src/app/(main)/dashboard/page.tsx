import { DashboardClient } from "@/app/(main)/_components/dashboard-client"
import { EventService, UnifiedEvent } from "@/lib/eventService"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  // Get the current user session
  const session = await auth.api.getSession({
    headers: await import('next/headers').then(m => m.headers())
  })

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch initial events on server
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(startDate.getDate() + 30)

  let initialEvents: UnifiedEvent[] = []
  try {
    initialEvents = await EventService.getAllEventsInRange(session.user.id, startDate, endDate)
  } catch (error) {
    console.error('Error loading initial events:', error)
    // Continue with empty events
  }

  return <DashboardClient initialEvents={initialEvents} />
}